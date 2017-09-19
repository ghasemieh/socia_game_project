/**
 * init cron
 */
var timings = require('./timings');
var _ = require('./_');


/**
 * load Models
 */
var Game = require('../models/Game');
var User = require('../models/User');


/**
 * main cronJob
 * @constructor
 */
function cronJob() {

}


/**
 * finish pending games and switch gamers' turn
 * @param io
 */
cronJob.prototype.finishPendingGames = function (io) {

    console.log(__filename + ', cronJob.prototype.finishPendingGames');

    timings.resetTimeoutsFromDatabase(io);

    // setInterval(function () {
    //
    //     if (finishPendingGamesFinishedProcess) {
    //         finishPendingGamesFinishedProcess = false;
    //         finishPendingGames(io, function () {
    //             finishPendingGamesFinishedProcess = true;
    //         })
    //     }
    //
    // }, finishPendingGamesTimeOut);
};


/**
 * reset all socket Ids
 */
cronJob.prototype.resetAllSocketIds = function () {

    console.log(__filename + ', cronJob.prototype.resetAllSocketIds');

    User.update({socketId: {$ne: null}}, {
        $set: {
            socketId: null,
            _data: {}
        }
    }, {multi: true}, function () {
        return true;
    });
    return true;
};


/**
 * finish pending games
 * @param io
 * @param callback
 */
function finishPendingGames(io, callback) {


    Game.find(
        {isFinished: false, gamerTimeout: {"$lte": new Date()}},
        null,
        {sort: {gamerTimeout: -1}},
        function (err, games) {


            if (err) {
                console.error(__filename + ', finishPendingGames, err: ' + err);
                return callback(true);
            }

            for (var i = 0; i < games.length; i++) {

                var game = games[i];
                var gameCore = _.gameCoreByGameType(game.gameType);


                console.log("game.gamerTimeout: " + game.gamerTimeout);
                console.log("now: " + new Date());


                console.log("gameCore.maxSwitchGamerTurn: " + gameCore.maxSwitchGamerTurn);
                console.log("game.gamerTimeoutCount: " + game.gamerTimeoutCount);


                if (gameCore.maxSwitchGamerTurn > game.gamerTimeoutCount) {
                    gameCore[game.gameType + "_switchGamerTurn"](io, game);
                } else {
                    gameCore[game.gameType + "_finishGame"](io, game);
                }

            }

            return callback(true);
        });
}


module.exports = new cronJob;
