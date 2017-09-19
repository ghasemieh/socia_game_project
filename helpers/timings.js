/**
 * load tools
 */
var _ = require("../helpers/_");


/**
 * load Models
 */
var Game = require('../models/Game');


/**
 * handling all timeouts
 */
var timings = {};


/**
 * init timeouts
 */
if (Object.keys(timings).length === 0) {
    timings.timeouts = {};
}


/**
 * clear all timeouts
 * @returns {boolean}
 */
 //@mohammadhb redis 
 //delete all docs
timings.clearAllTimeouts = function () {
    var i;
    for (i in timings.timeouts) {
        clearTimeout(timings.timeouts.i);
    }

    timings.timeouts = {};

    return true;
};


/**
 * update|set a timeout
 * @param io
 * @param game
 * @param duration
 * @returns {boolean}
 */

 //@mohammadhb redis 
 //set expire time = duration
timings.updateTimeout = function (io, game, duration) {

    var gameId = game._id.toString();

    if (timings.timeouts.hasOwnProperty(gameId)) {
        clearTimeout(timings.timeouts[gameId]);
    }

    var gameCore = _.gameCoreByGameType(game.gameType);

    timings.timeouts[gameId] = setTimeout(function () {
        gameCore[game.gameType + "_playingTimeFinished"](io, game);
    }, duration);

    return true;
};


/**
 * Reset timeouts from database
 * @param io
 */
 //@mohammadhb redis 
 //refresh expire time
timings.resetTimeoutsFromDatabase = function (io) {

    var i, gameCore;

    timings.clearAllTimeouts();

    Game.find({isFinished: false}, function (err, games) {

        if (err) {
            console.error('resetTimeoutsFromDatabase', err);
            return false;
        }

        for (i = 0; i < games.length; i++) {
            gameCore = _.gameCoreByGameType(games[i].gameType);
            timings.updateTimeout(io, games[i], gameCore.maxTimeForPlaying * 1000);
        }
    });
};


/**
 * show log
 * @param label
 */
timings.log = function (label) {
    console.log(label + ' - timings', timings)
};


module.exports = timings;
