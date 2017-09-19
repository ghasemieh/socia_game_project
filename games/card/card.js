/**
 * load tools
 * maxTimeForPlaying: max time for playing in seconds
 * maxSwitchGamerTurn: times
 */
var _ = require("../../helpers/_");
var dobApi = require("../../helpers/dobApi");
var symbols = require("./symbols");
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
    'easy': {width: 4, height: 4},
    'normal': {width: 6, height: 6},
    'hard': {width: 8, height: 8}
};


/**
 * card core game
 * @type {*}
 */
var card = {
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
card.card_startGame = function (io, socket, user, opponent) {

//    console.log(__filename + ', card.card_startGame');

    var remainedLifeKey = user.gameLevel + "RemainedLife";
    var spentLifeKey = user.gameLevel + "SpentLife";

    card_createGame(user, opponent, function (err, game) {

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

                return card_sendNextStep(io, game, user, opponent);
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
card.card_resumeGame = function (io, socket, game, user) {

    _.gamersByGame(game, function (err, gamers) {

        if (err) return _.sendError(io, socket, "خطا در واکشی کاربران بازی!" + ", err: " + err);

        var opponent = gamers[0];
        if (user._id.toString() === gamers[0]._id.toString()) {
            opponent = gamers[1];
        }

        card_resumeGame(io, socket, game, user, opponent);
    });

};


/**
 * Playing time finished
 * @param io
 * @param game
 */
card.card_playingTimeFinished = function (io, game) {

//    console.log(__filename + ', card.card_playingTimeFinished');


    Game.findOne({_id: game._id}, function (err, game) {

        if (game.isFinished) {
            return false;
        }

        console.log(`>>>>>>>>>CARD MAX ${card.maxSwitchGamerTurn} ? ${card.maxSwitchGamerTurn}`);

        if (card.maxSwitchGamerTurn > game.gamerTimeoutCount) {
            card_switchGamerTurn(io, game);
            //consol e.log(`>>>>>>>>>CARD MAX ${card.maxSwitchGamerTurn} > ${card.maxSwitchGamerTurn}`);
            return true;
        }

        console.log(`>>>>>>>>>CARD MAX ${card.maxSwitchGamerTurn} < ${card.maxSwitchGamerTurn}`);

        _.gamersByGame(game, function (err, gamers) {


            if (err) {
                console.error("card.card_playingTimeFinished, _.gamersByGame, gamers.length, game._id: " + game._id);

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


            card_finishGame(game, winner, loser, function (err, game, winner, loser) {

                if (err) {
                    console.error("card.card_playingTimeFinished, err: " + err + " ,game._id:" + game._id);
                    return false;
                }

                var message = {};
                message[winner._id] = 'حریفتان ' + maxSwitchGamerTurn + ' نوبت بازی نکرد به همین خاطر شما برنده شدید.';
                message[loser._id] = 'شما ' + maxSwitchGamerTurn + ' نوبت بازی نکردید به همین خاطر شما بازنده شدید.';

                card_sendNextStep(io, game, winner, loser, message);
                return true;
            });

        });

    });

};


/**
 * switch the gamer's turn from socket
 * @param io
 * @param game
 */
card_switchGamerTurn = function (io, game) {

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

    var data = game.data;
    data.flip = {i: null, j: null, symbol: ""};
    data.flips = [];

    game.data = {};
    game.data = data;

    game.save(function () {

        _.gamersByGame(game, function (err, gamers) {
            if (err) {
                console.error("card.card_switchGamerTurn, _.gamersByGame, err: " + err + ", game._id: " + game._id);
                return false;
            }

            card_resumeGame(io, null, game, gamers[0], gamers[1]);
        });

    });
};


/**
 * flip card from socket
 * @param io
 * @param socket
 * @returns {Function}
 */
card.card_flipCard = function (io, socket) {

    return function (data) {
//        console.log('card.card_flipCard = function (io, socket) {');


        var i = parseInt(data.i) > -1 ? parseInt(data.i) : -1;
        var j = parseInt(data.j) > -1 ? parseInt(data.j) : -1;

        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, err);
            if (!user) return _.sendError(io, socket, "if (!user)");

            // get Game
            card_getGameByUser(user, function (err, game) {

                if (err) return _.sendError(io, socket, err);
                if (!game) return _.sendError(io, socket, "if (!game)");


                var opponentId = game.gamer1;
                if (opponentId === user._id.toString()) {
                    opponentId = game.gamer2;
                }

                User.getUserById(opponentId, function (err, opponent) {
                    if (err) return _.sendError(io, socket, err);
                    if (!opponent) return _.sendError(io, socket, "if (!opponent)");

                    // HERE we have user, game and opponent

                    // check the status
                    if (game.isFinished) return _.sendError(io, socket, "if (game.isFinished)");
                    if (game.gamerTurn !== user._id.toString()) return _.sendError(io, socket, "if (game.gamerTurn != user._id)");
                    if (game.winner) return _.sendError(io, socket, "if (game.winner)");

                    // draw line
                    card_flipCard(io, socket, game, user, opponent, i, j);
                    return true;
                });

            });


        });

    };
};


/**
 * finish the game
 * @param game
 * @param winner
 * @param loser
 * @param callback
 */
var card_finishGame = function (game, winner, loser, callback) {

//    console.log('var card_finishGame = function (game, winner, loser, callback) {');

    var spentLife = game.gameLevel + "SpentLife";
    var remainedLife = game.gameLevel + "RemainedLife";


    game.winner = winner._id;
    game.isFinished = true;
    game.save(function (err, game) {


        if (err) return callback(err, null, null, null);

        // update wins count
        winner.wins.push(game._id);
        winner.winsCount = (parseInt(winner.winsCount) || 0) + 3;

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
var card_sendNextStep = function (io, game, user, opponent, message) {

//    console.log('card_sendNextStep = function (io, game, user, opponent) {');


    var gamer1 = user;
    var gamer2 = opponent;
    if (game.gamer2 === user._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }

    var nextStep = {};
    nextStep.board = game.data.board;


    // hide undiscovered symbols
    var width = parseInt(init[game.gameLevel].width);
    var height = parseInt(init[game.gameLevel].height);
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            if (!nextStep.board[i][j].winnerId) {
                nextStep.board[i][j].symbol = '';
            }
        }
    }


    if (game.isGameDraw) {
        nextStep.isGameDraw = true;
    } else {
        nextStep.isGameDraw = false;
    }

    if (game.data.flip.i !== null) {
        nextStep.flip = game.data.flip;
    }

    if (game.data.flips.length) {
        nextStep.flips = game.data.flips;
    }

    nextStep.gamerTurn = game.gamerTurn;
    nextStep.gamer1 = {_id: gamer1._id, nickname: gamer1.nickname};
    nextStep.gamer2 = {_id: gamer2._id, nickname: gamer2.nickname};
    nextStep.scores = game.data.scores;


    var t1 = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    var t2 = new Date();
    var timeToPLay = _.diffTimeInSecond(t1, t2);
    nextStep.timeToPLay = timeToPLay > 0 ? timeToPLay : 0;

    // check winner
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
        io.to(user.socketId).emit('card_nextStep', nextStep);
    }

    if (opponent.socketId) {
        io.to(opponent.socketId).emit('card_nextStep', nextStep);
    }

    timings.updateTimeout(io, game, parseInt(nextStep.timeToPLay) * 1000);

    return true;
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
var card_resumeGame = function (io, socket, game, user, opponent) {

//    console.log('var card_resumeGame = function (io, socket, user, game, opponent) {');

    if (opponent) {
        return card_sendNextStep(io, game, user, opponent);
    }

    var opponentId = game.gamer1;
    if (opponentId === user._id.toString()) {
        opponentId = game.gamer2;
    }

    User.getUserById(opponentId, function (err, opponent) {

        if (err) return _.sendError(io, socket, err);
        if (!opponent) return _.sendError(io, socket, "if (!opponent)");

        return card_sendNextStep(io, game, user, opponent);
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
var card_createGame = function (user, opponent, callback) {

//    console.log(__filename + ', var card_createGame');

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

    var width = parseInt(init[gameLevel].width);
    var height = parseInt(init[gameLevel].height);

    // select symbols
    var selectedSymbols = [];
    var selectedSymbol;
    for (var i = 0; i < parseInt((width * height) / 2); i++) {
        do {
            selectedSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        } while (selectedSymbols.indexOf(selectedSymbol) !== -1);

        selectedSymbols.push(selectedSymbol);
        selectedSymbols.push(selectedSymbol);
    }
    selectedSymbols = _.shuffleArray(selectedSymbols);


    // make board
    var board = [];
    for (i = 0; i < width; i++) {
        board[i] = [];
        for (var j = 0; j < height; j++) {
            board[i][j] = {
                'symbol': selectedSymbols.pop(),
                'winnerId': null
            };
        }
    }

    var scores = {};
    scores[game.gamer1] = 0;
    scores[game.gamer2] = 0;

    game.data = {};
    game.data.board = board;
    game.data.scores = scores;
    game.data.flip = {i: null, j: null, symbol: ""};
    game.data.flips = [];
    game.save(function (err, game) {
        return callback(err, game);
    });

};


/**
 * check the game whether is over or not
 * @param board
 * @param scores
 * @returns {boolean}
 */
var card_isGameOver = function (board, scores) {

//    console.log('var card_isGameOver = function (board, scores) {');

    var width = board.length;
    var height = board[0].length;

    var maxScore = (width * height) / 2;

    var gameScore = 0;
    for (var score in scores) {
        if (scores.hasOwnProperty(score)) {
            gameScore += parseInt(scores[score]);
        }
    }

    return (maxScore === gameScore);
};


/**
 * is game draw
 * @param scores
 * @returns {boolean}
 */
var card_isGameDraw = function (scores) {

//    console.log('var card_isGameDraw = function (scores) {');

    var previousScore = false;
    for (var score in scores) {
        if (!previousScore) {
            previousScore = scores[score];
            continue;
        }

        if (previousScore === scores[score]) {
            return true;
        }
    }

    return false;
};


/**
 * reset the game
 * @param game
 * @param callback
 */
var card_resetGame = function (game, callback) {

//    console.log('var card_resetGame = function (game, callback) {');


    var gameLevel = game.gameLevel;

    game.gamerTurn = game.gamer1;
    game.gamerPlayedAt = new Date();
    game.lastTimePlayedGamer = game.gamer2;
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    game.gamerTimeoutCount = 0;

    var width = parseInt(init[gameLevel].width);
    var height = parseInt(init[gameLevel].height);

    // select symbols
    var selectedSymbols = [];
    var selectedSymbol;
    for (var i = 0; i < parseInt((width * height) / 2); i++) {
        do {
            selectedSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        } while (selectedSymbols.indexOf(selectedSymbol) !== -1);

        selectedSymbols.push(selectedSymbol);
        selectedSymbols.push(selectedSymbol);
    }
    selectedSymbols = _.shuffleArray(selectedSymbols);


    // make board
    var board = [];
    for (i = 0; i < width; i++) {
        board[i] = [];
        for (var j = 0; j < height; j++) {
            board[i][j] = {
                'symbol': selectedSymbols.pop(),
                'winnerId': null
            };
        }
    }

    var scores = {};
    scores[game.gamer1] = 0;
    scores[game.gamer2] = 0;

    game.data = {};
    game.data.board = board;
    game.data.scores = {};
    game.data.scores = scores;
    game.data.flip = {i: null, j: null, symbol: ""};
    game.data.flips = [];
    game.save(function (err, game) {
        return callback(err, game);
    });
};


/**
 * get game by user
 * @param user
 * @param callback
 * @returns {*}
 */
var card_getGameByUser = function (user, callback) {

//    console.log('var card_getGameByUser = function (user, callback) {');

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
var card_searchForOpponent = function (user, callback) {

//    console.log('var card_searchForOpponent = function (user, callback) {');

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
 * flip card
 * @param io
 * @param socket
 * @param game
 * @param user
 * @param opponent
 * @param i
 * @param j
 * @returns {*}
 */
var card_flipCard = function (io, socket, game, user, opponent, i, j) {

//    console.log(__filename + ', var card_flipCard');

    var checkGame = false;

    // check i, j
    var maxW = init[game.gameLevel].width;
    var maxH = init[game.gameLevel].height;


    if (i < 0 || i > maxW) {
        return _.sendError(io, socket, "if (i < 0 || i > maxW) {");
    }
    if (j < 0 || j > maxH) {
        return _.sendError(io, socket, "if (j < 0 || j > maxH) {");
    }

    // get data
    var board = game.data.board;
    var scores = game.data.scores;
    var flip = game.data.flip;
    var flips = [];
    var gamerTurn = opponent._id;

    // check the box

    if (board[i][j].winnerId)
        return _.sendError(io, socket, "if (board[i][j].winnerId)");

    if (flip.i === i && flip.j === j)
        return _.sendError(io, socket, "if (flip.i == i && flip.j == j)");

    // check flip status
    if (flip.i !== null) {
        checkGame = true;
        if (flip.symbol === board[i][j].symbol) {
            gamerTurn = user._id;
            board[i][j].winnerId = user._id;
            board[flip.i][flip.j].winnerId = user._id;
            scores[user._id] = (parseInt(scores[user._id]) || 0) + 1;


            if (card_isGameOver(board, scores)) {

                if (card_isGameDraw(scores)) {
                    return card_resetGame(game, function (err, game) {

                        if (err) return _.sendError(io, socket, "return card_resetGame(game, function (err, game) {");

                        game.isGameDraw = true;
                        return card_sendNextStep(io, game, user, opponent);
                    });
                }

                var winner = user;
                var loser = opponent;
                if (scores[opponent._id] > scores[user._id]) {
                    winner = opponent;
                    loser = user;
                }

                return card_finishGame(game, winner, loser, function (err, game, winner, loser) {

                    if (err) return _.sendError(io, socket, "return card_finishGame(game, winner, loser, function (err, game, winner, loser) {");

                    return card_sendNextStep(io, game, winner, loser);
                });
            }

        } else {
            flips.push(flip);
            flips.push({i: i, j: j, symbol: board[i][j].symbol});
        }

        game.lastTimePlayedGamer = user._id;

        flip = {i: null, j: null, symbol: ""};
    } else {

        game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
        game.gamerTimeoutCount = 0;
        game.save();

        gamerTurn = user._id;
        flip = {i: i, j: j, symbol: board[i][j].symbol};
    }


    if (checkGame) {
        game.gamerPlayedAt = new Date();
    }
    


    game.gamerTurn = gamerTurn;
    game.data = {};
    game.data.board = board;
    game.data.flip = {};
    game.data.flip = flip;
    game.data.flips = [];
    game.data.flips = flips;
    game.data.scores = {};
    game.data.scores = scores;
    game.save(function (err, game) {
        if (err) return _.sendError(io, socket, "game.save(function (err, game) {");

        return card_sendNextStep(io, game, user, opponent);
    });

};


module.exports = card;
