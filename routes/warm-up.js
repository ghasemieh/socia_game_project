var express = require('express');
var router = express.Router();
var _ = require("../helpers/_");


router.get('/:gameType/:gameLevel', function (req, res, next) {

    var gameType = req.params.gameType;
    var gameLevel = req.params.gameLevel;

    // check available games
    if (!_.isGameAvailable(gameType, gameLevel)) {
        return res.redirect('/games');
    }


    // can user play
    if (!_.isGameAvailable(gameType, gameLevel)) {
        return res.redirect('/games');
    }


    // render view
    res.render('warmUp_' + gameType, {
        title: _.localize.translate("menuPlay"),
        gameType: gameType,
        gameLevel: gameLevel
    });

});


module.exports = router;
