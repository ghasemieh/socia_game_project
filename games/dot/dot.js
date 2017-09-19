/**
 * load tools
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
 * init
 */
var init = {
    'easy': {width: 5, height: 5},
    'normal': {width: 7, height: 7},
    'hard': {width: 9, height: 9}
};


/**
 * dot core game
 * @type {*}
 */
var dot = {
    maxTimeForPlaying: maxTimeForPlaying,
    maxSwitchGamerTurn: maxSwitchGamerTurn,
    init: init
};


/**
 * start the game from socket
 * @param io
 * @param socket
 * @param user
 * @param opponent
 */
dot.dot_startGame = function (io, socket, user, opponent) {

//    console.log(__filename + ', dot.dot_startGame');

    var remainedLifeKey = user.gameLevel + "RemainedLife";
    var spentLifeKey = user.gameLevel + "SpentLife";

    dot_createGame(user, opponent, function (err, game) {

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

                return dot_sendNextStep(io, game, user, opponent);
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
dot.dot_resumeGame = function (io, socket, game, user) {

    _.gamersByGame(game, function (err, gamers) {

        if (err) return _.sendError(io, socket, "خطا در واکشی کاربران بازی!" + ", err: " + err);

        var opponent = gamers[0];
        if (user._id === gamers[0]._id) {
            opponent = gamers[1];
        }

        dot_resumeGame(io, socket, game, user, opponent);
    });

};


/**
 * Playing time finished
 * @param io
 * @param game
 */
dot.dot_playingTimeFinished = function (io, game) {

//    console.log(__filename + ', dot.dot_playingTimeFinished');


    Game.findOne({_id: game._id}, function (err, game) {

        if (game.isFinished) {
            return false;
        }

        if (dot.maxSwitchGamerTurn > game.gamerTimeoutCount) {
            dot_switchGamerTurn(io, game);
            return true;
        }


        _.gamersByGame(game, function (err, gamers) {


            if (err) {
                console.error("dot.dot_playingTimeFinished, _.gamersByGame, gamers.length, game._id: " + game._id);

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


            dot_finishGame(game, winner, loser, function (err, game, winner, loser) {

                if (err) {
                    console.error("dot.dot_playingTimeFinished, dot_finishGame, err: " + err + " ,game._id:" + game._id);
                    return false;
                }

                var message = {};
                message[winner._id] = 'حریفتان ' + maxSwitchGamerTurn + ' نوبت بازی نکرد به همین خاطر شما برنده شدید.';
                message[loser._id] = 'شما ' + maxSwitchGamerTurn + ' نوبت بازی نکردید به همین خاطر شما بازنده شدید.';


                dot_sendNextStep(io, game, winner, loser, message);
                return true;
            });

        });

    });

};


/**
 * draw a new line from socket
 * @param io
 * @param socket
 * @returns {Function}
 */
dot.dot_drawLine = function (io, socket) {

    return function (data) {

//        console.log('dot.dot_drawLine = function (io, socket) {');


        // validate side, i, i
        var side = data.side;
        if (side !== 'h' && side !== 'v') {
            return _.sendError(io, socket, "if (side !== 'h' && side !== 'v') {");
        }

        var i = parseInt(data.i);
        if (!_.isInt(i)) return _.sendError(io, socket, "if(!_.isInt(i)){");
        if (i < 0) {
            return _.sendError(io, socket, "if (i < 0) {");
        }

        var j = parseInt(data.j);
        if (!_.isInt(j)) return _.sendError(io, socket, "if(!_.isInt(j)){");
        if (j < 0) {
            return _.sendError(io, socket, "if (j < 0) {");
        }


        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, err);
            if (!user) return _.sendError(io, socket, "if (!user)");

            // get Game
            dot_getGameByUser(user, function (err, game) {

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
                    if (game.gamerTurn !== user._id.toString()) return _.sendError(io, socket, "if (game.gamerTurn != user.id)");
                    if (game.winner) return _.sendError(io, socket, "if (game.winner)");

                    // draw line
                    dot_drawLine(io, socket, game, user, opponent, side, i, j);
                    return true;
                });

            });


        });

    };

};


/**
 * switch the gamer's turn from socket
 * @param io
 * @param game
 */
dot_switchGamerTurn = function (io, game) {

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
                console.error("dot.dot_switchGamerTurn, _.gamersByGame, err: " + err + ", game._id: " + game._id);
                return false;
            }

            dot_resumeGame(io, null, game, gamers[0], gamers[1]);
        });

    });
};


/**
 * send next step
 * @param io
 * @param game
 * @param user
 * @param opponent
 * @param message
 * @returns {boolean}
 */
var dot_sendNextStep = function (io, game, user, opponent, message) {

//    console.log('dot_sendNextStep = function (io, game, user, opponent) {');

    var gamer1 = user;
    var gamer2 = opponent;
    if (game.gamer2 === user._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }

    var nextStep = {};
    nextStep.board = game.data;
    nextStep.gamerTurn = game.gamerTurn;
    nextStep.userRed = {_id: gamer1._id, nickname: gamer1.nickname};
    nextStep.userBlue = {_id: gamer2._id, nickname: gamer2.nickname};


    var t1 = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    var t2 = new Date();
    var timeToPLay = _.diffTimeInSecond(t1, t2);
    nextStep.timeToPLay = timeToPLay > 0 ? timeToPLay : 0;


    if (game.isGameDraw) {
        nextStep.isGameDraw = true;
    } else {
        nextStep.isGameDraw = false;
    }

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


    if (user.socketId) {
        io.to(user.socketId).emit('dot_nextStep', nextStep);
    }

    if (opponent.socketId) {
        io.to(opponent.socketId).emit('dot_nextStep', nextStep);
    }


    // console.log('nextStep');
    // console.log(nextStep);


    // console.log('wins');
    // console.log(nextStep.board.wins);


    // console.log('vedges');
    // console.log(nextStep.board.vedges);


    // console.log('hedges');
    // console.log(nextStep.board.hedges);

    timings.updateTimeout(io, game, parseInt(nextStep.timeToPLay) * 1000);

    return true;
};


/**
 * finish the game
 * @param game
 * @param winner
 * @param loser
 * @param callback
 */
var dot_finishGame = function (game, winner, loser, callback) {

//    console.log(__filename + ', dot_finishGame');

    var spentLife = game.gameLevel + "SpentLife";
    var remainedLife = game.gameLevel + "RemainedLife";

    game.winner = winner._id;
    game.isFinished = true;
    game.save(function (err, game) {

        if (err) return callback(err, null, null, null);

        // update wins count
        winner.wins.push(game._id);
        winner.winsCount = (parseInt(winner.winsCount) || 0) + 2;

        // live saves for winner
        winner[spentLife] = (parseInt(winner[spentLife]) || 0) - 1;
        winner[remainedLife] = (parseInt(winner[remainedLife]) || 0) + 1;

        // update statistics
        var gamesResults = winner.gamesResults;
        gamesResults[game.gameType][game.gameLevel].playsCount += 1;
        gamesResults[game.gameType][game.gameLevel].winsCount += 1;
        winner.gamesResults = {};
        winner.gamesResults = gamesResults;


        // update user level
        // var userLevels;
        // if (game.gameLevel === 'easy') {
        //     if (winner.gamesResults[game.gameType][game.gameLevel].winsCount > 9) {
        //         if (winner.userLevels[game.gameType].indexOf('normal') === -1) {
        //             userLevels = winner.userLevels;
        //             userLevels[game.gameType].push('normal');
        //             winner.userLevels = {};
        //             winner.userLevels = userLevels;
        //         }
        //     }
        // } else if (game.gameLevel === 'normal') {
        //     if (winner.gamesResults[game.gameType][game.gameLevel].winsCount > 9) {
        //         if (winner.userLevels[game.gameType].indexOf('hard') === -1) {
        //             userLevels = winner.userLevels;
        //             userLevels[game.gameType].push('hard');
        //             winner.userLevels = {};
        //             winner.userLevels = userLevels;
        //         }
        //     }
        // }

        // remove temporary data
        winner.wins.push(game._id);
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
var dot_createGame = function (user, opponent, callback) {

//    console.log('var dot_createGame = function (user, opponent, callback) {');

    var gameType = user.gameType;
    var gameLevel = user.gameLevel;


    var width = init[gameLevel].width;
    var height = init[gameLevel].height;

    var data = {};
    data.width = width;
    data.height = height;
    data.hedges = [];
    data.vedges = [];
    data.wins = [];

    data.scores = {};
    data.scores[user._id] = 0;
    data.scores[opponent._id] = 0;


    for (var i = 0; i < height - 1; i++) {
        var row = [];
        for (var j = 0; j < width - 1; j++) {
            row.push(0);
        }

        data.wins.push(row);
    }

    for (i = 0; i < height; i++) {
        row = [];
        for (j = 0; j < width; j++) {
            row.push(0);
        }

        data.hedges.push(row);
        data.vedges.push(row);
    }

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
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.lastTimePlayedGamer = (game.gamerTurn == game.gamer1 ? game.gamer2 : game.gamer1);
    game.gamerTimeoutCount = 0;
    game.data = data;

    game.save(function (err, game) {
        return callback(err, game);
    });
};


/**
 * draw a new line
 * @param io
 * @param socket
 * @param game
 * @param user
 * @param opponent
 * @param side
 * @param i
 * @param j
 * @returns {*}
 */
var dot_drawLine = function (io, socket, game, user, opponent, side, i, j) {

//    console.log('var dot_drawLine = function (io, socket, game, user, opponent, side, i, j) {');

    // get edge
    var edge = "hedges";
    if (side === 'v')
        edge = "vedges";


    // get board
    var board = game.data;


    // check i, j
    var maxH = init[game.gameLevel].width;
    var maxV = init[game.gameLevel].height;


    if (i < 0 || i > maxH) {
        return _.sendError(io, socket, "if (i < 0 || i > maxH) {");
    }

    if (j < 0 || j > maxV) {
        return _.sendError(io, socket, "if (j < 0 || j > maxV) {");
    }


    // check the line
    if (board[edge][i][j] !== 0)
        return _.sendError(io, socket, "if (board[edge][i][j] !== 0)");


    // get user color
    var color = 'r';
    if (game.gamer1 === opponent._id.toString()) {
        color = 'b';
    }

    // update board
    board[edge][i][j] = color;


    // check win
    var wins = dot_checkWin(board, edge, i, j);
    if (wins.length == 0) {
        game.gamerTurn = opponent._id;
    } else {
        for (i = 0; i < wins.length; i++) {
            board.scores[user._id] += 1;
            board.wins[wins[i].i][wins[i].j] = color;
        }
    }

    // next step
    if (!dot_isGameOver(board)) {

        game.data = {};
        game.gamerPlayedAt = new Date();
        game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
        game.gamerTimeoutCount = 0;
        game.lastTimePlayedGamer = user._id;

        game.data = board;
        return game.save(function (err, game) {
            if (err) return _.sendError(io, socket, "game.save(function (err, game) {");
            return dot_sendNextStep(io, game, user, opponent);
        });
    }


    // draw, reset the game
    if (board.scores[user._id] === board.scores[opponent._id]) {
        return dot_resetGame(game, function (err, game) {

            if (err) _.sendError(io, socket, err);

            game.isGameDraw = true;
            return dot_sendNextStep(io, game, user, opponent);
        });
    }


    // detect winner and loser
    var winner = user;
    var loser = opponent;
    if (board.scores[loser._id] > board.scores[winner._id]) {
        winner = opponent;
        loser = user;
    }


    game.data = {};
    game.data = board;
    return dot_finishGame(game, winner, loser, function (err, game, winner, loser) {

        if (err) _.sendError(io, socket, err);

        return dot_sendNextStep(io, game, winner, loser);
    });

};


/**
 * get game by user
 * @param user
 * @param callback
 * @returns {*}
 */
var dot_getGameByUser = function (user, callback) {

//    console.log(__filename + ', dot_getGameByUser');

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
 * resume the game
 * @param io
 * @param socket
 * @param game
 * @param user
 * @param opponent
 * @returns {boolean}
 */
var dot_resumeGame = function (io, socket, game, user, opponent) {

    console.log('var dot_resumeGame = function (io, socket, user, game, opponent) {');

    if (opponent) {
        return dot_sendNextStep(io, game, user, opponent);
    }

    var opponentId = game.gamer1;
    if (opponentId === user._id.toString()) {
        opponentId = game.gamer2;
    }

    User.getUserById(opponentId, function (err, opponent) {

        if (err) return _.sendError(io, socket, err);
        if (!opponent) return _.sendError(io, socket, "if (!opponent)");

        return dot_sendNextStep(io, game, user, opponent);
    });
};


/**
 * search for opponent
 * @param user
 * @param callback
 */
var dot_searchForOpponent = function (user, callback) {

    console.log('var dot_searchForOpponent = function (user, callback) {');

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


/**
 * check win
 * @param board
 * @param edge
 * @param i
 * @param j
 * @returns {Array}
 */
var dot_checkWin = function (board, edge, i, j) {

    var wins = [];

    console.log('var dot_checkWin = function (board, edge, i, j) {');

    // check vedges
    if (edge === 'vedges') {

        // check left
        if (
            (_.isSet(board.hedges, i, j) && board.hedges[i][j] !== 0) &&
            (_.isSet(board.vedges, i, (j + 1)) && board.vedges[i][j + 1] !== 0) &&
            (_.isSet(board.hedges, (i + 1), j) && board.hedges[i + 1][j] !== 0)
        ) {
            wins.push({i: i, j: j});
        }


        // check right
        if (
            (_.isSet(board.hedges, i, (j - 1)) && board.hedges[i][j - 1] !== 0) &&
            (_.isSet(board.vedges, i, (j - 1)) && board.vedges[i][j - 1] !== 0) &&
            (_.isSet(board.hedges, (i + 1), (j - 1)) && board.hedges[i + 1][j - 1] !== 0)
        ) {
            wins.push({i: i, j: j - 1});
        }
    } else {

        // check hedges


        // check top
        if (
            (_.isSet(board.hedges, (i - 1), j) && board.hedges[i - 1][j] !== 0 ) &&
            (_.isSet(board.vedges, (i - 1), (j + 1)) && board.vedges[i - 1][j + 1] !== 0 ) &&
            (_.isSet(board.vedges, (i - 1), (j )) && board.vedges[i - 1][j] !== 0)
        ) {
            wins.push({i: i - 1, j: j});
        }


        // check bottom
        if (
            (_.isSet(board.vedges, i, (j + 1)) && board.vedges[i][j + 1] !== 0) &&
            (_.isSet(board.hedges, (i + 1), j) && board.hedges[i + 1][j] !== 0) &&
            (_.isSet(board.vedges, i, j) && board.vedges[i][j] !== 0)
        ) {
            wins.push({i: i, j: j});
        }
    }

    // console.log('wins');
    // console.log(wins);
    return wins;
};


/**
 * check the game whether is over or not
 * @param board
 * @returns {boolean}
 */
var dot_isGameOver = function (board) {

    console.log('var dot_isGameOver = function (board) {');
    // console.log(board);

    for (var i = 0; i < board.wins.length; i++) {
        for (var j = 0; j < board.wins[0].length; j++) {
            if (board.wins[i][j] === 0) {
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
var dot_resetGame = function (game, callback) {

    console.log('var dot_resetGame = function (game, callback) {');


    var gameType = game.gameType;
    var gameLevel = game.gameLevel;


    var width = init[gameLevel].width;
    var height = init[gameLevel].height;

    var data = {};
    data.width = width;
    data.height = height;
    data.hedges = [];
    data.vedges = [];
    data.wins = [];

    data.scores = {};
    data.scores[game.gamer1] = 0;
    data.scores[game.gamer2] = 0;


    for (var i = 0; i < height - 1; i++) {
        var row = [];
        for (var j = 0; j < width - 1; j++) {
            row.push(0);
        }

        data.wins.push(row);
    }

    for (i = 0; i < height; i++) {
        row = [];
        for (j = 0; j < width; j++) {
            row.push(0);
        }

        data.hedges.push(row);
        data.vedges.push(row);
    }

    game.gamerTurn = game.gamer1;
    game.startedAt = new Date();
    game.gameLevel = gameLevel;
    game.gameType = gameType;
    game.gamerPlayedAt = new Date();
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = 0;
    game.data = {};
    game.data = data;
    game.save(function (err, game) {
        return callback(err, game);
    });
};


module.exports = dot;
