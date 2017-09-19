var _ = require("../helpers/_");
var dobApi = require("../helpers/dobApi");
var battleship = require("../games/battleship/battleship");


// load models
var Game = require('../models/Game');
var User = require('../models/User');


/**
 * game methods
 */
function game() {
    this.io = null;
    this.socket = null;
}


/**
 *
 * @param io
 * @param socket
 * @param user
 */
game.prototype.gamerConnected = function (io, socket, user) {

    //console.log(__filename + ', game.prototype.gamerConnected');

    this.io = io;
    this.socket = socket;


    var gameType = socket.handshake.query.gameType;
    var gameLevel = socket.handshake.query.gameLevel;


    getGameByUser(user, function (err, game) {

        if (err) return _.sendError(io, socket, err);


        // game found
        if (game) {

            // resume game
            if (game.gameType === gameType && game.gameLevel === gameLevel) {
                return resumeGame(io, socket, game, user);
            }

            return _.sendError(io, socket, 'شما بازی  تمام نشده دیگری دارید!');
        }

        // check available games
        if (!_.isGameAvailable(gameType, gameLevel)) return socket.disconnect();


        user.gameType = gameType;
        user.gameLevel = gameLevel;
        user.gameId = undefined;
        user.isPlaying = undefined;
        user.save(function () {

            // has charge
            _.hasCharge(user, function (err, hasCharged) {

                if (err) return _.sendError(io, socket, "خطا در بررسی شارژ کاربر!" + ", err: " + err);

                if (!hasCharged) {
                    io.to(socket.id).emit('userNeedCharging');
                    socket.disconnect();
                    return false;
                }

                // searching for opponent
                searchForOpponent(user, function (err, opponent) {

                    if (err) return _.sendError(io, socket, "خطا در یافتن حریف!" + ", err: " + err);

                    // waiting for opponent
                    if (!opponent) {
                        io.to(socket.id).emit(gameType + '_waitingForOpponent');

                        if (gameType === "battleship") {
                            battleship.battleship_sendYouCanArrange(io, user);
                        }

                        return true;
                    }

                    // opponent found - start the game
                    return startGame(io, socket, user, opponent);
                });

            });


        });

    });

};


/**
 *
 * @param io
 * @param socket
 * @returns {Function}
 */
game.prototype.sendPinConfirmation = function (io, socket) {

    return function (data) {

//        console.log(__filename + ', game.prototype.sendPinConfirmation');


        // get charge info
        var uniqueId = data.uniqueId;
        var pin = data.pin;
        var transactionId = data.transactionId;

        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, "خطا در واکشی اطلاعات کاربر!" + ", err: " + err);

            if (!user) return _.sendError(io, socket, "کاربر یافت نشد!" + ", in: game.prototype.sendPinConfirmation");

            var gameType = user.gameType;

            // check confirmation
            _.sendPinConfirmation(user, uniqueId, pin, transactionId, function (err, user, hasCharged, charge) {

                if (err) return _.sendError(io, socket, err);

                if (hasCharged) {

                    // searching for opponent
                    searchForOpponent(user, function (err, opponent) {

                        if (err) return _.sendError(io, socket, "خطا در یافتن حریف!" + ", err: " + err);

                        // waiting for opponent
                        if (!opponent) {
                            io.to(socket.id).emit(gameType + '_waitingForOpponent');

                            if (gameType === "battleship") {
                                battleship.battleship_sendYouCanArrange(io, user);
                            }

                            return true;
                        }

                        // opponent found - start the game
                        return startGame(io, socket, user, opponent);
                    });

                    return true;
                }


                return io.to(socket.id).emit(gameType + '_waitingForPayment', {
                    uniqueId: charge.uniqueId,
                    transactionId: charge.transactionId,
                    message: _.localize.translate(charge.message)
                });
            });

        });
    }

};


/**
 *
 * @param user
 * @param callback
 * @returns {*}
 */
function getGameByUser(user, callback) {

//    console.log(__filename + ', function getGameByUser');

    if (!user.gameId) {
        return callback(null, null);
    }


    Game.findOne({
        _id: user.gameId,
        isFinished: false
    }, function (err, game) {
        return callback(err, game);
    });
}


/**
 *
 * @param io
 * @param socket
 * @param game
 * @param user
 * @returns {*}
 */
function resumeGame(io, socket, game, user) {

//    console.log(__filename + ', function resumeGame');

    var gameType = game.gameType;
    var gameCore = _.gameCoreByGameType(gameType);

    return gameCore[gameType + '_resumeGame'](io, socket, game, user);
}


/**
 *
 * @param user
 * @param callback
 */
function searchForOpponent(user, callback) {

//    console.log(__filename + ', function searchForOpponent(user, callback) {');

    var queryObject = {
        gameType: user.gameType,
        gameLevel: user.gameLevel,
        gameId: null,
        isPlaying: null,
        _id: {$ne: user._id},
        socketId: {$ne: null},
        winsCount: {$lte: user.winsCount}
    };
    queryObject[user.gameLevel + "RemainedLife"] = {$gt: 0};


    // User.findOne(queryObject, null, {sort: {updatedAt: -1, winsCount: -1}}, function (err, opponent1) {

    //     if (err) {
    //         return callback(err, null);
    //     }

    //     queryObject.winsCount = {$gt: user.winsCount};
    //     User.findOne(queryObject, null, {sort: {updatedAt: -1, winsCount: 1}}, function (err, opponent2) {

    //         if (err) {
    //             return callback(err, null);
    //         }

    //         if (!opponent1 && !opponent2) {
    //             return callback(null, null);
    //         }

    //         if (opponent1 && !opponent2) {
    //             return callback(null, opponent1);
    //         }

    //         if (!opponent1 && opponent2) {
    //             return callback(null, opponent2);
    //         }

    //         var diffOpponent1 = Math.abs(user.winsCount - opponent1.winsCount);
    //         var diffOpponent2 = Math.abs(user.winsCount - opponent2.winsCount);

    //         if (diffOpponent1 < diffOpponent2) {
    //             return callback(null, opponent1);
    //         }

    //         return callback(null, opponent2);
    //     });
    // });

     User.find(queryObject, null, {}, function (err, opponents) {


        console.log("<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< ALL")
        console.log(`<<<<<<<<<<<<<<<<< FOUND : ${opponents.length} <<<<<< ALL`)

        if (err) {
            console.log(`<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< ERRRROOOOORRR`)
            return callback(err, null);
        }

        /*

        @mohammadhb

        nearest player score algorithm
        faster algorithm

        */

        let minDiff = null;
        let minDiffOpp = null;

        for (let opp in opponents){

            console.log(`<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< LOOPING`)

            const diff = user.winsCount - opponents[opp].winsCount;

            if(!minDiff){

                minDiff = Math.abs(diff);
                minDiffOpp = opponents[opp];

            } else if (Math.abs(diff) < minDiff ){

                minDiff = Math.abs(diff);
                minDiffOpp = opponents[opp];

            }

        }

        if(minDiffOpp) {

            console.log(`<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< USER : ${user.nickname} -> ${user.winsCount}`);
            console.log(`<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< USER : ${minDiffOpp.nickname} -> ${minDiffOpp.winsCount}`);

            console.log(`<<<<<<<<<<<<<<<<< FINDING OPPONENT <<<<<< MIN DEF : ${minDiff}`);

            return callback(null,minDiffOpp);
        }

        return callback(null,null);

    });
}

/**
 *
 * @param io
 * @param socket
 * @param user
 * @param opponent
 * @returns {*}
 */
function startGame(io, socket, user, opponent) {

//    console.log(__filename + ', function startGame');

    var gameType = user.gameType;
    var gameCore = _.gameCoreByGameType(gameType);

    var functionName = gameType + '_startGame';

    return gameCore[functionName](io, socket, user, opponent);
}


module.exports = new game;
