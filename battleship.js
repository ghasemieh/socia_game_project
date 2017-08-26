/**
 * load tools
 * maxTimeForPlaying: max time for playing in seconds
 * maxSwitchGamerTurn: times
 */
var _ = require("../../helpers/_");
var dobApi = require("../../helpers/dobApi");

var maxTimeForPlaying = 3000000;
var maxTimeForArranging = 160;
var maxSwitchGamerTurn = 4;
var delayInternetTime = 2;


/**
 * Settings
 * grid: -1=empty, 0=shoot, 1=hit, 2=surroundings
 */
var Settings = {
    easy: {
        rows: 10,
        cols: 10,
        ships: [

            {
                i: 0,
                j: 0,
                size: 1,
                hits: 0,
                horizontal: true
            }
            ,
            {
                i: 0,
                j: 0,
                size: 1,
                hits: 0,
                horizontal: true
            }
            ,
            {
                i: 0,
                j: 0,
                size: 1,
                hits: 0,
                horizontal: true
            }
            ,
            {
                i: 0,
                j: 0,
                size: 1,
                hits: 0,
                horizontal: true
            },


            {
                i: 0,
                j: 0,
                size: 2,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 2,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 2,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 2,
                hits: 0,
                horizontal: true
            },

            {
                i: 0,
                j: 0,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 0,
                j: 0,
                size: 4,
                hits: 0,
                horizontal: true
            }

        ]
    },
    normal: {
        rows: 10,
        cols: 10,
        ships: [
            {
                i: 1,
                j: 1,
                size: 4,
                hits: 0,
                horizontal: true
            },
            {
                i: 4,
                j: 2,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 6,
                j: 5,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 8,
                j: 8,
                size: 2,
                hits: 0,
                horizontal: true
            }
        ]
    },
    hard: {
        rows: 10,
        cols: 10,
        ships: [
            {
                i: 1,
                j: 1,
                size: 4,
                hits: 0,
                horizontal: true
            },
            {
                i: 4,
                j: 2,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 6,
                j: 5,
                size: 3,
                hits: 0,
                horizontal: true
            },
            {
                i: 8,
                j: 8,
                size: 2,
                hits: 0,
                horizontal: true
            }
        ]
    }
};


/**
 * load Models
 */
var Game = require('../../models/Game');
var User = require('../../models/User');


/**
 * battleship core game
 * @type {*}
 */
var battleship = {
    maxTimeForPlaying: maxTimeForPlaying,
    maxSwitchGamerTurn: maxSwitchGamerTurn,
    maxTimeForArranging: maxTimeForArranging
};


/**
 * start the game from socket
 * @param io
 * @param socket
 * @param user
 * @param opponent
 */
battleship.battleship_startGame = function (io, socket, user, opponent) {

    console.log(__filename + ', battleship.battleship_startGame');

    var remainedLifeKey = user.gameLevel + "RemainedLife";
    var spentLifeKey = user.gameLevel + "SpentLife";

    battleship_createGame(user, opponent, function (err, game) {

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

                if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
                    return battleship_resumeGame(io, socket, game, user, opponent);
                }

                return battleship_sendCreateGame(io, game, user, opponent);
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
battleship.battleship_resumeGame = function (io, socket, game, user) {


    console.log(__filename + ', battleship.battleship_resumeGame');


    _.gamersByGame(game, function (err, gamers) {

        if (err) return _.sendError(io, socket, "خطا در واکشی کاربران بازی!" + ", err: " + err);

        var opponent = gamers[0];
        if (user._id.toString() === opponent._id.toString()) {
            opponent = gamers[1];
        }

        if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
            return battleship_resumeGame(io, socket, game, user, opponent);
        }

        battleship_sendCreateGame(io, game, user, opponent);

    });

};


/**
 * playing time finished
 * @param io
 * @param game
 */
battleship.battleship_playingTimeFinished = function (io, game) {
    console.log(__filename + ', dot.dot_playingTimeFinished');


    Game.findOne({_id: game._id}, function (err, game) {

        if (game.isFinished) {
            return false;
        }

        if (battleship.maxSwitchGamerTurn > game.gamerTimeoutCount) {
            battleship_switchGamerTurn(io, game);
            return true;
        }


        _.gamersByGame(game, function (err, gamers) {


            if (err) {
                console.error("battleship.battleship_playingTimeFinished, _.gamersByGame, gamers.length, game._id: " + game._id);

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


            battleship_finishGame(game, winner, loser, function (err, game, winner, loser) {

                if (err) {
                    console.error("dot.dot_playingTimeFinished, dot_finishGame, err: " + err + " ,game._id:" + game._id);
                    return false;
                }

                var message = {};
                message[winner._id] = 'حریفتان ' + maxSwitchGamerTurn + ' نوبت بازی نکرد به همین خاطر شما برنده شدید.';
                message[loser._id] = 'شما ' + maxSwitchGamerTurn + ' نوبت بازی نکردید به همین خاطر شما بازنده شدید.';


                battleship_sendNextStep(io, game, winner, loser, message);
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
battleship.battleship_switchGamerTurn = function (io, game) {

    console.log(__filename + ", battleship.battleship_switchGamerTurn");

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
                console.error(__filename + ", _.gamersByGame, err: " + err + ", game._id: " + game._id);
                return false;
            }

            return battleship_resumeGame(io, null, game, gamers[0], gamers[1]);
        });

    });
};


/**
 * user can arrange before opponent is found
 * @param io
 * @param user
 * @returns {boolean}
 */
battleship.battleship_sendYouCanArrange = function (io, user) {

    console.log(__filename + ', battleship.battleship_sendYouCanArrange');

    var data = Settings[user.gameLevel];

    io.to(user.socketId).emit('battleship_waitingForArranging', data);

    return true;
};


/**
 * arranging the ships is done
 * @param io
 * @param socket
 * @returns {Function}
 */
battleship.battleship_arrangeDone = function (io, socket) {

    return function (data) {

        console.log(__filename + ', battleship.battleship_arrangeDone');

        var ships = data.ships;

        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, err);
            if (!user) return _.sendError(io, socket, "if (!user)");

            battleship_arrangeDone(io, socket, user, ships);
        });

    };
};


/**
 * player shoots
 * @param io
 * @param socket
 * @returns {Function}
 */
battleship.battleship_shoot = function (io, socket) {

    return function (data) {

        console.log(__filename + ', battleship.battleship_shoot');

        var i = parseInt(data.i);
        var j = parseInt(data.j);

        if (isNaN(i)) return _.sendError(io, socket, "if (isNaN(i))");
        if (isNaN(j)) return _.sendError(io, socket, "if (isNaN(j))");

        var _id = socket['decoded_token']._doc._id;

        User.getUserById(_id, function (err, user) {

            if (err) return _.sendError(io, socket, err);
            if (!user) return _.sendError(io, socket, "if (!user)");

            battleship_getGameByUser(user, function (err, game) {

                if (err) return _.sendError(io, socket, err);
                if (!game) return _.sendError(io, socket, "if (!game)");

                var opponentId = game.gamer1;
                if (opponentId === user._id.toString()) {
                    opponentId = game.gamer2;
                }

                User.getUserById(opponentId, function (err, opponent) {

                    if (err) return _.sendError(io, socket, err);
                    if (!opponent) return _.sendError(io, socket, "if (!opponent)");

                    // io, socket, i, j, user, game, opponent
                    return battleship_shoot(io, socket, i, j, user, game, opponent);

                });


            });

        });

    };


};


var battleship_switchGamerTurn = function () {

};


/**
 * finish the game from socket
 * @param io
 * @param game
 */
// var battleship_finishGame = function (io, game) {
//
//     console.log(__filename + ", battleship.battleship_finishGame");
//
//     _.gamersByGame(game, function (err, gamers) {
//
//         if (err) {
//             console.error(__filename + ", game._id: " + game._id);
//
//             game.isFinished = true;
//             game.save(function () {
//             });
//             return false;
//         }
//
//         // detect loser and winner
//         var winner = gamers[1];
//         var loser = gamers[0];
//         if (game.lastTimePlayedGamer === gamers[0]._id.toString()) {
//             winner = gamers[0];
//             loser = gamers[1];
//         }
//
//         battleship_finishGame(game, winner, loser, function (err, game, winner, loser) {
//
//             if (err) {
//                 console.error("battleship.battleship_finishGame, battleship_finishGame, err: " + err + " ,game._id:" + game._id);
//                 return false;
//             }
//
//             battleship_sendNextStep(io, game, winner, loser);
//             return true;
//         });
//
//     });
//
// };

/**
 * arranging the ships are done
 * @param io
 * @param socket
 * @param user
 * @param ships
 * @returns {*}
 */
var battleship_arrangeDone = function (io, socket, user, ships) {


    if (ships.length !== Settings[user.gameLevel].ships.length) {
        return _.sendError(io, socket, 'ships are not valid!');
    }

    battleship_getGameByUser(user, function (err, game) {

        if (err) return _.sendError(io, socket, err);

        if (!game) {

            var _data = user._data;
            _data.ships = ships;

            user._data = {};
            user._data = _data;

            user.save(function () {
                io.to(user.socketId).emit('battleship_notification', 'ترکیب شما چیده شد! منتظر یافتن حریف...');
                io.to(user.socketId).emit('battleship_waitingForOpponent');
                return true;
            });

            return true;
        }


        _.gamersByGame(game, function (err, gamers) {

            if (err) return _.sendError(io, socket, err);
            if (!gamers) return _.sendError(io, socket, 'gamers not found!');


            var opponent = gamers[0];
            if (opponent._id.toString() === user._id.toString()) {
                opponent = gamers[1];
            }


            var userNumber = 'gamer1';
            if (user._id.toString() === game.gamer2) {
                userNumber = 'gamer2';
            }

            var data = game.data;
            data[userNumber].ships = ships;
            data[userNumber + "Arranged"] = true;


            game.data = {};
            game.data = data;
            game.save(function (err, game) {

                if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
                    return battleship_resumeGame(io, socket, game, user, opponent);
                }

                io.to(user.socketId).emit('battleship_notification', 'ترکیب شما چیده شد! منتظر ترکیب چینی حریف...');
                io.to(user.socketId).emit('battleship_waitingForOpponent');

                io.to(opponent.socketId).emit('battleship_notification', 'حریفتان ترکیب چید و منتظر ترکیب چینی شماست...');
                io.to(opponent.socketId).emit('battleship_waitingForArranging', Settings[opponent.gameLevel]);

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
 */
var battleship_sendNextStep = function (io, game, user, opponent) {

    console.log(__filename + ', var battleship_sendNextStep');

    var gamer1 = user;
    var gamer2 = opponent;
    if (game.gamer2 === user._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }


    var nextStep = {};
    nextStep.gamer1 = game.data.gamer1;
    nextStep.gamer1._id = gamer1._id.toString();

    nextStep.gamer2 = game.data.gamer2;
    nextStep.gamer2._id = gamer2._id.toString();

    nextStep.gamerTurn = game.gamerTurn;


    var t1 = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    var t2 = new Date();
    var timeToPLay = _.diffTimeInSecond(t1, t2);
    timeToPLay = timeToPLay > 0 ? timeToPLay : 0;
    nextStep.timeToPLay = timeToPLay - delayInternetTime;

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


    var gamer1Ships = nextStep.gamer1.ships;
    var gamer2Ships = nextStep.gamer2.ships;


    if (gamer1.socketId) {

        delete nextStep.gamer2.ships;
        nextStep.gamer1.ships = gamer1Ships;

        io.to(gamer1.socketId).emit('battleship_nextStep', nextStep);
    }

    if (gamer2.socketId) {

        delete nextStep.gamer1.ships;
        nextStep.gamer2.ships = gamer2Ships;

        io.to(gamer2.socketId).emit('battleship_nextStep', nextStep);
    }

    return true;
};


/**
 * send a new game
 * @param io
 * @param game
 * @param user
 * @param opponent
 * @returns {boolean}
 */
var battleship_sendCreateGame = function (io, game, user, opponent) {

    console.log(__filename + ', battleship_sendCreateGame');

    var gamer1 = user;
    var gamer2 = opponent;
    if (game.gamer2 === user._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }

    var nextStep = Settings[user.gameLevel];

    var t1 = _.addSeconds(game.gamerPlayedAt, maxTimeForPlaying);
    var t2 = new Date();
    var timeToPLay = _.diffTimeInSecond(t1, t2);
    timeToPLay = timeToPLay > 0 ? timeToPLay : 0;
    nextStep.timeToPLay = timeToPLay;


    if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
        io.to(gamer1.socketId).emit('battleship_notification', 'هر دو حریف ترکیب چیدید، شروع بازی.');
        io.to(gamer2.socketId).emit('battleship_notification', 'هر دو حریف ترکیب چیدید، شروع بازی.');
    } else if (game.data.gamer1Arranged && !game.data.gamer2Arranged) {
        io.to(gamer1.socketId).emit('battleship_notification', 'شما ترکیب چیدید! منتظر ترکیب چینی حریف...');
        io.to(gamer2.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    } else if (!game.data.gamer1Arranged && game.data.gamer2Arranged) {
        io.to(gamer2.socketId).emit('battleship_notification', 'حریفتان ترکیب چیده است! منتظر ترکیب چینی شماست...');
        io.to(gamer1.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    } else {
        io.to(gamer1.socketId).emit('battleship_notification', 'هر دو حریف در حال ترکب چینی هستید...');
        io.to(gamer2.socketId).emit('battleship_notification', 'هر دو حریف در حال ترکب چینی هستید...');
    }

    // if (gamer1.socketId) {
    //
    //     if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
    //         io.to(gamer1.socketId).emit('battleship_notification', 'هر دو حریف ترکیب چیدند، شروع بازی.');
    //     } else if (game.data.gamer1Arranged && !game.data.gamer2Arranged) {
    //         io.to(gamer1.socketId).emit('battleship_notification', 'شما ترکیب چیدید! منتظر ترکیب چینی حریف...');
    //         io.to(gamer2.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     } else if (!game.data.gamer1Arranged && game.data.gamer2Arranged) {
    //         io.to(gamer1.socketId).emit('battleship_notification', 'حریفتان ترکیب چیده است! منتظر ترکیب چینی شماست...');
    //         io.to(gamer1.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     } else {
    //         io.to(gamer1.socketId).emit('battleship_notification', 'هر دو حریف در حال ترکب چینی هستند!');
    //         io.to(gamer1.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     }
    //
    // }
    //
    //
    // if (gamer2.socketId) {
    //
    //     if (game.data.gamer1Arranged && game.data.gamer2Arranged) {
    //         io.to(gamer2.socketId).emit('battleship_notification', 'هر دو حریف ترکیب چیدند، شروع بازی.');
    //     } else if (!game.data.gamer1Arranged && game.data.gamer2Arranged) {
    //         io.to(gamer2.socketId).emit('battleship_notification', 'شما ترکیب چیدید! منتظر ترکیب چینی حریف...');
    //         io.to(gamer1.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     } else if (game.data.gamer1Arranged && !game.data.gamer2Arranged) {
    //         io.to(gamer2.socketId).emit('battleship_notification', 'حریفتان ترکیب چیده است! منتظر ترکیب چینی شماست...');
    //         io.to(gamer2.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     } else {
    //         io.to(gamer2.socketId).emit('battleship_notification', 'هر دو حریف در حال ترکب چینی هستند!');
    //         io.to(gamer2.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    //     }
    // }

    return true;
};


/**
 * finish the game
 * @param game
 * @param winner
 * @param loser
 * @param callback
 */
var battleship_finishGame = function (game, winner, loser, callback) {

    console.log(__filename + ', battleship_finishGame');

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


/**
 * create a new game
 * @param user
 * @param opponent
 * @param callback
 */
var battleship_createGame = function (user, opponent, callback) {

    console.log(__filename + ', var battleship_createGame');

    var gameType = user.gameType;
    var gameLevel = user.gameLevel;

    var i, j, raw, _data, data = {}, grid = [];

    var setting = Settings[gameLevel];


    // make grid
    for (i = 0; i < setting.rows; i++) {
        raw = [];
        for (j = 0; j < setting.cols; j++) {
            raw.push(-1);
        }
        grid.push(raw);
    }


    // make gamer 1
    data.gamer1 = {};
    data.gamer1.grid = grid;
    data.gamer1.ships = setting.ships;


    // make gamer 2
    data.gamer2 = data.gamer1;


    data.gamer1Arranged = false;
    data.gamer2Arranged = false;


    if (opponent._data.ships) {

        data.gamer1Arranged = true;
        data.gamer1.ships = opponent._data.ships;

        _data = opponent._data;
        delete _data.ships;
        opponent._data = {};
        opponent._data = _data;
        opponent.save(function () {
        });
    }


    if (user._data.ships) {

        data.gamer2Arranged = true;
        data.gamer2.ships = user._data.ships;

        _data = user._data;
        delete _data.ships;
        user._data = {};
        user._data = _data;
        user.save(function () {
        });
    }


    var game = new Game();
    game.gamer1 = opponent._id;
    game.gamer2 = user._id;
    game.gamerTurn = game.gamer1;
    game.startedAt = new Date();
    game.gameLevel = gameLevel;
    game.gameType = gameType;
    game.gamerPlayedAt = new Date();
    game.gamerTimeout = _.addSeconds(game.gamerPlayedAt, maxTimeForArranging);
    game.gamerTimeoutCount = 0;
    game.data = data;

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
var battleship_getGameByUser = function (user, callback) {

    console.log(__filename + ', battleship_getGameByUser');

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
var battleship_resumeGame = function (io, socket, game, user, opponent) {

    console.log(__filename + ', var battleship_resumeGame');

    if (game.data.gamer1Arranged && game.data.gamer2Arranged) {


        if (opponent) {
            return battleship_sendNextStep(io, game, user, opponent);
        }

        var opponentId = game.gamer1;
        if (opponentId === user._id.toString()) {
            opponentId = game.gamer2;
        }

        User.getUserById(opponentId, function (err, opponent) {

            if (err) return _.sendError(io, socket, err);
            if (!opponent) return _.sendError(io, socket, "if (!opponent)");

            return battleship_sendNextStep(io, game, user, opponent);
        });

        return true;
    }


    var gamer1 = user, gamer2 = opponent;
    if (game.gamer1.toString() !== gamer1._id.toString()) {
        gamer1 = opponent;
        gamer2 = user;
    }

    if (!game.data.gamer1Arranged) {
        io.to(gamer1.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    }


    if (!game.data.gamer2Arranged) {
        io.to(gamer2.socketId).emit('battleship_waitingForArranging', Settings[user.gameLevel]);
    }
};


var battleship_shoot = function (io, socket, i, j, user, game, opponent) {

    var gamerNumber = 1;
    var opponentNumber = 2;
    if (game.data.gamer2._id === user._id.toString()) {
        gamerNumber = 2;
        opponentNumber = 1;
    }

    var data = game.data;


    // check if user's turn
    if (user._id.toString() !== game.gamerTurn) {
        return _.sendError(io, socket, 'نوبت شما نیست!');
    }


    // check if i, j is valid
    if (i < 0 || i > (data.gamer1.grid.length - 1)) {
        return _.sendError(io, socket, 'i is invalid!');
    }
    if (j < 0 || j > (data.gamer1.grid[0].length - 1)) {
        return _.sendError(io, socket, 'j is invalid!');
    }


    // check if shoot place is empty
    if (data["gamer" + opponentNumber].grid[i][j] !== -1) {
        return _.sendError(io, socket, 'این نقطه پیش‌تر شلیک شده است!');
    }


    // update the grid
    data["gamer" + opponentNumber].ships[grid][i][j] = 0;


    // check if ship shot
    var shotShip = shotShip(data["gamer" + opponentNumber].ships, i, j);
    if (shotShip === -1) {


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
                    console.error(__filename + ", _.gamersByGame, err: " + err + ", game._id: " + game._id);
                    return false;
                }

                return battleship_resumeGame(io, null, game, gamers[0], gamers[1]);
            });

        });
        return true;
    }


    // update the data
    data["gamer" + opponentNumber].ships[shotShip].hits += 1;


    // check if ship is sunk
    if (!isShipSunk(data["gamer" + opponentNumber].ships[shotShip])) {
        // save data and send next step
        return true;
    }

    // update the grid
    // make all round of ships disable to click


    // check if all ships are sunk
    if (!isGameOver(data["gamer" + opponentNumber].ships)) {
        // save data and send next step
        return true;
    }


    // this is game over
    return true;


    game.data = {};
    game.data = data;
    game.save(function (err, game) {

        if (err) _.sendError(io, socket, err);

    });

};


/**
 * is ship hit
 * @param ships
 * @param i
 * @param j
 * @returns {Number}
 */
function shotShip(ships, i, j) {

    // extract all points
    var ship, points = {};
    for (var k = 0; k < ships.length; k++) {

        ship = ships[k];
        points[ship.i + "_" + ship.j] = k;


        for (var m = 0; m < (ship.size - 1); m++) {
            if (ship.horizontal) {
                points[(ship.i + 1) + "_" + ship.j] = k;
            } else {
                points[ship.i + "_" + (ship.j + 1)] = k;
            }
        }
    }

    if (!points.hasOwnProperty([i + "_" + j]))
        return -1;

    return parseInt(points[i + "_" + j]);
}


/**
 * is ship sunk
 * @param ship
 * @returns {boolean}
 */
function isShipSunk(ship) {
    return ship.hits === ship.size;
}


/**
 * check if is game over
 * @param ships
 * @returns {boolean}
 */
function isGameOver(ships) {

    for (var i = 0; i < ships.length; i++) {
        if (ships[i].hits !== ships[i].size) {
            return false;
        }
    }
    return true;
}


module.exports = battleship;
