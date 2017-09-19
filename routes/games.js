var express = require('express');
var router = express.Router();
var _ = require("../helpers/_");

router.get('/', function (req, res, next) {
    res.render('games', {title: _.localize.translate("menuGames")});
});


router.post('/', function (req, res, next) {

    console.log(__filename + ", router.post('/', function (req, res, next) {");

    var gameType, game, games = [], now = new Date();

    console.log('now', now);

    for (gameType in new Object(_.availableGames)) {

        game = _.availableGames[gameType];

        game.gameType = gameType;

        if (game.finishAt < now) {
            game.status = 'finished';

            if (!game.winner) {
                game.winner = 'بررسی نتایج...';
            }
        } else if (game.startAt > now) {
            game.status = 'comingSoon';
            game.timeToStart = _.diffTimeInSecond(game.startAt, now);
        } else {
            game.status = 'onFire';
        }

        games.push(game);
    }

    res.json(games);
});

module.exports = router;
