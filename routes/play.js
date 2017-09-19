var express = require('express');
var router = express.Router();
var _ = require("../helpers/_");

router.get('/remainingTime',function(req,res,next){

    let start = new Date();
    let end = new Date();

    //general
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);

    if (end.getHours() > 21)
        end.setDate(start.getDate()+1);

    //deadend
    end.setHours(21);

    let deadEnd = (end - start)/1000;

    //freshstart
    end.setHours(9);

    if (start.getHours() > 9) 
        end.setDate(start.getDate()+1);

    let freshStart = (end - start)/1000;

    res.send ({

        deadEnd:{

            remaining:Math.floor(deadEnd),
            unit:"seconds"
        },

        freshStart:{

            remaining:Math.floor(freshStart),
            unit:"seconds"

        }

    });

});

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
    res.render('play_' + gameType, {
        title: _.localize.translate("menuPlay"),
        gameType: gameType,
        gameLevel: gameLevel
    });

});


module.exports = router;
