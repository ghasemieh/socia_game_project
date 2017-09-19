/**
 * init
 * maxTimeForPlaying: max time for playing in seconds
 * maxSwitchGamerTurn: times
 */
var _ = require("../../helpers/_");
var dobApi = require("../../helpers/dobApi");
var timings = require("../../helpers/timings");
var maxTimeForPlaying = 15;
var maxSwitchGamerTurn = 0;

/**
 * load Models
 */
var Game = require('../../models/Game');
var User = require('../../models/User');


/**
 * xo core game
 * @type {*}
 */
var xo = {
    maxTimeForPlaying: maxTimeForPlaying,
    maxSwitchGamerTurn: maxSwitchGamerTurn
};

//@mohammadhb waiting time
var intervalSeconds = 1;
var gamePlaytimeOffSeconds = 10;
var waitingsList = [];

setInterval(function() {

    console.log('CLOCK >_  reducing timesssssssss')
    waitingsList.map(function(obj){obj.timeout--});
    waitingsList=waitingsList.filter(function(obj){return obj.timeout<=0});

}, 1000*intervalSeconds);


/**
 * start the game from socket
 * @param io
 * @param socket
 * @param user
 * @param opponent
 */
xo.xo_startGame = function (io, socket, user, opponent) {
    console.log('var xo_startGame = function (io, socket, user, opponent) {');


    var remainedLifeKey = user.gameLevel + "RemainedLife";
    var spentLifeKey = user.gameLevel + "SpentLife";

    var waiter = waitingsList.find(function(obj){

        return obj.gamer == user._id || obj.gamer == opponent._id;

    });

    console.log(waitingsList)

    do {

        waiter = waitingsList.find(function(obj){

          return obj.gamer == user || obj.gamer == opponent;

        });

        console.log("*************** waiting for player timeoff")
        console.log(user)
        console.log(opponent)
        console.log(waitingsList)
        console.log(waiter)

    } while (waiter)

    xo_createGame(user, opponent, function (err, game) {

        if (err) return _.sendError(io, socket, err);
        if (!game) return _.sendError(io, socket, "if (!game)");


        user.gameId = game._id;
        user.playsCount = (parseInt(user.playsCount) || 0) + 1;
        user[remainedLifeKey] = parseInt(user[remainedLifeKey]) - 1;
        user[spentLifeKey] = parseInt(user[spentLifeKey]) + 1;
        user.isPlaying = game.gameType;
        user.save(function (err, user) {

            if (err) return _.sendError(io, socket, err);

            opponent.gameId = game._id;
            opponent.playsCount = (parseInt(opponent.playsCount) || 0) + 1;
            opponent[remainedLifeKey] = parseInt(opponent[remainedLifeKey]) - 1;
            opponent[spentLifeKey] = parseInt(opponent[spentLifeKey]) + 1;
            opponent.isPlaying = game.gameType;
            opponent.save(function (err, opponent) {

                if (err) return _.sendError(io, socket, err);

                return xo_sendNextStep(io, game, user, opponent);
            });
        });

    });

};


/**
 * resume the game from socket
 * @param io
 * @param socket
 * @param game
 * @param user
 */
xo.xo_resumeGame = function (io, socket, game, user) {

	console.log("------------------- RESUME GAME")
	console.log(game)

    _.gamersByGame(game, function (err, gamers) {

        if (err) return _.sendError(io, socket, "خطا در واکشی کاربران بازی!" + ", err: " + err);

        err && console.log("------------------- RESUME GAME ERR");
        console.log(gamers)

        var opponent = gamers[0];
        if (user._id.toString() === gamers[0]._id.toString()) {
            opponent = gamers[1];
        }


        xo_resumeGame(io, socket, game, user, opponent);
    });

};


/**
 * Playing time finished
 * @param io
 * @param game
 */
xo.xo_playingTimeFinished = function (io, game) {

    console.log(__filename + ', xo.xo_playingTimeFinished');


    Game.findOne({_id: game._id}, function (err, game) {

        //let isFinishedWithNoMoving = false;

        console.log(">>>>>>>>>>>>>> FINISHED PLAYING TIME >>>>>>>>>>>>>>")
        console.log(xo);
        console.log(game);

        if (game.isFinished) {

            return false;
        }

        if (xo.maxSwitchGamerTurn > game.gamerTimeoutCount) {
            
            xo_switchGamerTurn(io, game);
            return true;
        }

        _.gamersByGame(game, function (err, gamers) {


            if (err) {
                console.error("xo.xo_finishGame, _.gamersByGame, gamers.length, game._id: " + game._id);

                game.isFinished = true;
                game.save();
                return false;
            }

            // detect loser and winner
            var winner = gamers[1];
            var loser = gamers[0];
            if (game.lastTimePlayedGamer === gamers[0]._id.toString()) {
                winner = gamers[0];
                loser = gamers[1];
            }


            xo_finishGame(game, winner, loser, function (err, game, winner, loser) {

                if (err) {
                    console.error("xo.xo_finishGame, xo_finishGame, err: " + err + " ,game._id:" + game._id);
                    return false;
                }

                var message = {};
                message[winner._id] = 'حریفتان ' + maxSwitchGamerTurn + ' نوبت بازی نکرد به همین خاطر شما برنده شدید.';
                message[loser._id] = 'شما ' + maxSwitchGamerTurn + ' نوبت بازی نکردید به همین خاطر شما بازنده شدید.';

                const gamer1_timeout = waitingsList.find(function(obj){

                    return obj.gamer == game.gamer1

                })

                if (!gamer1_timeout)
                    waitingsList.push({
                        gamer:game.gamer1,
                        timeout:gamePlaytimeOffSeconds
                    });

                const gamer2_timeout = waitingsList.find(function(obj){

                    return obj.gamer == game.gamer2

                })

                if (!gamer2_timeout)
                    waitingsList.push({
                        gamer:game.gamer2,
                        timeout:gamePlaytimeOffSeconds
                    });

                console.log(waitingsList);

                xo_sendNextStep(io, game, winner, loser, message);
                return true;
            });

        });

    });

};


/**
 * place a new marker from socket
 * @param io
 * @param socket
 * @returns {Function}
 */
xo.xo_placeMarker = function (io, socket) {

    return function (data) {

        console.log('xo.xo_placeMarker = function (io, socket) {');


        var x = parseInt(data.x);
        var y = parseInt(data.y);


        if (!_.between(x, 0, 2)) return _.sendError(io, socket, "if (!_.between(x, 0, 2))");
        if (!_.between(y, 0, 2)) return _.sendError(io, socket, "if (!_.between(y, 0, 2))");


        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, err);
            if (!user) return _.sendError(io, socket, "if (!user)");

            // get Game
            xo_getGameByUser(user, function (err, game) {

                if (err) return _.sendError(io, socket, err);
                if (!game) return _.sendError(io, socket, "if (!game)");


                var opponentId = game.gamer1;
                if (opponentId === user._id.toString()) {
                    opponentId = game.gamer2;
                }

                User.findOne({_id: opponentId}, function (err, opponent) {
                    if (err) return _.sendError(io, socket, err);
                    if (!opponent) return _.sendError(io, socket, "if (!opponent)");

                    // HERE we have user, game and opponent

                    // check the status
                    if (game.gamerTurn !== user._id.toString()) return _.sendError(io, socket, "نوبت حریف شماست!");
                    if (game.winner) return _.sendError(io, socket, "بازی به اتمام رسیده است!");

                    // place marker
                    xo_placeMarker(io, socket, game, user, opponent, x, y);
                    return true;
                });

            });


        });
    }

};


/**
 * switch the gamer's turn from socket
 * @param io
 * @param game
 */
var xo_switchGamerTurn = function (io, game) {

    var gamerTurn = game.gamer1;
    var lastTimePlayedGamer = game.gamer2;
    if (game.gamerTurn === gamerTurn) {
        gamerTurn = game.gamer2;
        lastTimePlayedGamer = game.gamer1;
    }


    game.gamerTurn = gamerTurn;
    game.gamerPlayedAt = new Date();
    game.lastTimePlayedGamer = lastTimePlayedGamer;
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = game.gamerTimeoutCount + 1;
    game.save(function () {

        _.gamersByGame(game, function (err, gamers) {
            if (err) {
                console.error("xo.xo_switchGamerTurn, _.gamersByGame, err: " + err + ", game._id: " + game._id);
                return false;
            }

            xo_resumeGame(io, null, game, gamers[0], gamers[1]);
        });

    });
};


/**
 * finish the game
 * @param game
 * @param winner
 * @param loser
 * @param callback
 */
var xo_finishGame = function (game, winner, loser, callback) {

    console.log('var xo.xo_finishGame = function (game, winner, loser, callback) {');

    var spentLife = game.gameLevel + "SpentLife";
    var remainedLife = game.gameLevel + "RemainedLife";


    game.winner = winner._id;
    game.isFinished = true;
    game.save(function (err, game) {


        if (err) return callback(err, null, null, null);

        // update wins count
        winner.wins.push(game._id);
        winner.winsCount = (parseInt(winner.winsCount) || 0) + 1;

        // live saves for winner
        winner[spentLife] = (parseInt(winner[spentLife]) || 0) - 1;
        winner[remainedLife] = (parseInt(winner[remainedLife]) || 0) + 1;

        // update statistics
        var gamesResults = winner.gamesResults;
        gamesResults[game.gameType][game.gameLevel].playsCount += 1;
        gamesResults[game.gameType][game.gameLevel].winsCount += 1;
        winner.gamesResults = {};
        winner.gamesResults = gamesResults;


        // remove temporary data
        winner.gameId = undefined;
        winner.isPlaying = undefined;
        winner.waitingForPlaying = undefined;
        winner.gameLevel = undefined;
        winner.gameType = undefined;
        winner.save(function (err, winner) {

            if (err) return callback(err, null, null, null);

            // update statistics
            gamesResults = loser.gamesResults;
            gamesResults[game.gameType][game.gameLevel].playsCount += 1;
            loser.gamesResults = {};
            loser.gamesResults = gamesResults;

            loser.loses.push(game._id);
            loser.gameId = undefined;
            loser.isPlaying = undefined;
            loser.waitingForPlaying = undefined;
            loser.gameLevel = undefined;
            loser.gameType = undefined;
            loser.save(function (err, loser) {
                if (err) return callback(err, null, null, null);

                return callback(null, game, winner, loser);
            });
        });
    });
};


/**
 * send next step
 * @param io
 * @param game
 * @param user
 * @param opponent
 * @returns {boolean}
 * @param message
 */
function xo_sendNextStep(io, game, user, opponent, message) {

    console.log(__filename + ", xo_sendNextStep");

    var gamer1 = user;
    var gamer2 = opponent;
    if (game.gamer2 === user._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }

    var nextStep = {};
    nextStep.board = game.data.board;
    nextStep.gamerTurn = game.gamerTurn;
    nextStep.userX = {_id: gamer1._id, nickname: gamer1.nickname};
    nextStep.userO = {_id: gamer2._id, nickname: gamer2.nickname};

    if (game.isGameDraw) {
        nextStep.isGameDraw = true;
    } else {
        nextStep.isGameDraw = false;
    }


    var t1 = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    var t2 = new Date();
    var timeToPLay = _.diffTimeInSecond(t1, t2);
    nextStep.timeToPLay = timeToPLay > 0 ? timeToPLay : 0;

    if (game.winner) {

        var winner = gamer1;
        if (game.winner === game.gamer2) {
            winner = gamer2;
        }

        var userData = {};
        userData._id = winner._id;
        userData.phone = winner.phone;
        userData.nickname = (winner.nickname === undefined) ? null : winner.nickname;
        userData.userLevels = winner.userLevels;

        userData.easyRemainedLife = user.easyRemainedLife;
        userData.easySpentLife = user.easySpentLife;

        userData.normalRemainedLife = user.normalRemainedLife;
        userData.normalSpentLife = user.normalSpentLife;

        userData.hardRemainedLife = user.hardRemainedLife;
        userData.hardSpentLife = user.hardSpentLife;

        userData.playsCount = user.playsCount;
        userData.winsCount = user.winsCount;

        nextStep.winner = userData;
    }

    nextStep.message = message;

    // console.log('nextStep');
    // console.log(nextStep);


    if (user.socketId) {
        io.to(user.socketId).emit('xo_nextStep', nextStep);
    }

    if (opponent.socketId) {
        io.to(opponent.socketId).emit('xo_nextStep', nextStep);
    }


    timings.updateTimeout(io, game, parseInt(nextStep.timeToPLay) * 1000);

    return true;
}

/**
 * resume the game
 * @param io
 * @param socket
 * @param game
 * @param user
 * @param opponent
 */
var xo_resumeGame = function (io, socket, game, user, opponent) {

    console.log('var xo_resumeGame = function (io, socket, user, game, opponent) {');


    if (opponent) {
        return xo_sendNextStep(io, game, user, opponent);
    }


    var opponentId = game.gamer1;
    if (opponentId === user._id.toString()) {
        opponentId = game.gamer2;
    }

    User.getUserById(opponentId, function (err, opponent) {

        if (err) return _.sendError(io, socket, err);
        if (!opponent) return _.sendError(io, socket, "if (!opponent)");

        return xo_sendNextStep(io, game, user, opponent);
    });
};


/** @mohammadhb
 * generates random number between 0,range [MAX_RANGE=492473]
 * @param range
 */

function generateRandomNumber(range) {

    const date = new Date();

    return (date.getHours() + date.getMinutes()* + date.getSeconds())%range;

}

/**
 * create a new game
 * @param user
 * @param opponent
 * @param callback
 */
var xo_createGame = function (user, opponent, callback) {

    console.log('var xo_createGame = function (user, opponent, callback) {');

    var gameType = user.gameType;
    var gameLevel = user.gameLevel;

    var game = new Game();
    game.gamer1 = opponent._id;
    game.gamer2 = user._id;

    if (generateRandomNumber(2)){
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>GAMER 1 TURN>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        game.gamerTurn = game.gamer1;
    }
    else{
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>GAMER 2 TURN>>>>>>>>>>>>>>>>>>>>>>>')
        game.gamerTurn = game.gamer2;
    }
    
    game.startedAt = new Date();
    game.gameLevel = gameLevel;
    game.gameType = gameType;
    game.gamerPlayedAt = new Date();
    game.lastTimePlayedGamer = (game.gamerTurn == game.gamer1 ? game.gamer2 : game.gamer1);
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = 0;

    game.data = {};
    game.data.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    game.save(function (err, game) {
        return callback(err, game);
    });

};


/**
 * check the game whether is over or not
 * @param board
 * @param marker
 * @returns {boolean}
 */
var xo_isGameOver = function (board, marker) {

    console.log('var xo_isGameOver = function (board, marker) {');

    // horizontal
    if (board[0][0] === marker && board[1][0] === marker && board[2][0] === marker) {
        return true;
    }
    if (board[0][1] === marker && board[1][1] === marker && board[2][1] === marker) {
        return true;
    }
    if (board[0][2] === marker && board[1][2] === marker && board[2][2] === marker) {
        return true;
    }


    // vertical
    if (board[0][0] === marker && board[0][1] === marker && board[0][2] === marker) {
        return true;
    }
    if (board[1][0] === marker && board[1][1] === marker && board[1][2] === marker) {
        return true;
    }
    if (board[2][0] === marker && board[2][1] === marker && board[2][2] === marker) {
        return true;
    }


    // diagonal top-left to bottom-right
    if (board[0][0] === marker && board[1][1] === marker && board[2][2] === marker) {
        return true;
    }

    // diagonal bottom-left to top-right
    return board[0][2] === marker && board[1][1] === marker && board[2][0] === marker;
};


/**
 * is game draw
 * @param board
 * @returns {boolean}
 */
var xo_isGameDraw = function (board) {

    console.log('var xo_isGameDraw = function (board) {');

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (parseInt(board[i][j]) === 0) {
                return false;
            }
        }
    }

    return true;
};


/**
 * reset the game
 * @param game
 * @param callback
 */
var xo_resetGame = function (game, callback) {

    console.log('var xo_resetGame = function (game, callback) {');

    game.gamerTurn = game.gamer1;
    game.gamerPlayedAt = new Date();
    game.lastTimePlayedGamer = game.gamer2;
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = 0;

    game.data = {};
    game.data.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    game.save(function (err, game) {
        return callback(err, game);
    });
};


/**
 * place a new marker
 * @param io
 * @param socket
 * @param game
 * @param user
 * @param opponent
 * @param x
 * @param y
 */
var xo_placeMarker = function (io, socket, game, user, opponent, x, y) {

    console.log('var xo_placeMarker = function (io, socket, game, user, opponent, x, y) {');

    var gameData = game.data;
    var board = gameData.board;
    var marker = game.gamer1 === user._id.toString() ? "x" : "o";

    // check selected boxes
    if (parseInt(board[x][y]) !== 0) {
        return _.sendError(io, socket, "این خانه پیش‌تر انتخاب شده است!");
    }

    // Update board
    board[x][y] = marker;

    game.gamerTurn = opponent._id;
    game.gamerPlayedAt = new Date();
    game.lastTimePlayedGamer = user._id.toString();
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = 0;
    game.data = {};
    game.data = {board: board};

    game.save(function (err, game) {

        if (err) return _.sendError(io, socket, err);

        // check for continue
        if (!xo_isGameOver(board, marker)) {

            // check for draw
            if (xo_isGameDraw(board)) {

                // reset the game
                return xo_resetGame(game, function (err, game) {

                    if (err) return _.sendError(io, socket, err);

                    game.isGameDraw = true;
                    xo_sendNextStep(io, game, user, opponent);
                });
            }

            return xo_sendNextStep(io, game, user, opponent);
        }


        xo_finishGame(game, user, opponent, function (err, game, winner, loser) {
            if (err) return _.sendError(io, socket, err);
            xo_sendNextStep(io, game, winner, loser);
            timings
            return true;
        });

    });
};


/**
 * get the game by user
 * @param user
 * @param callback
 * @returns {*}
 */
var xo_getGameByUser = function (user, callback) {

    console.log('var xo_getGameByUser = function (user, callback) {');

    if (!user.gameId) {
        return callback(null, null);
    }


    Game.findOne({
        _id: user.gameId,
        isFinished: false
    }, function (err, game) {
        return callback(err, game);
    });
};


/**
 * search for opponent
 * @param user
 * @param callback
 */
var xo_searchForOpponent = function (user, callback) {

    console.log('var xo_searchForOpponent = function (user, callback) {');

    var queryObject = {
        gameType: user.gameType,
        gameLevel: user.gameLevel,
        gameId: null,
        isPlaying: null,
        _id: {$ne: user._id},
        socketId: {$ne: null}
    };
    queryObject[user.gameLevel + "RemainedLife"] = {$gt: 0};

    User.findOne(queryObject, null, {sort: {updatedAt: -1}}, function (err, opponent) {
        return callback(err, opponent);
    });
};


module.exports = xo;
