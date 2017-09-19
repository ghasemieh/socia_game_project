var express = require('express');
var router = express.Router();

var Winners = require('../models/Winners');

router.post('/',function(req,res,next){

	const selector = {


	};

	const callback = function(error,winners) {

		winners.splice(0,winners.length-4);

		winners.sort(function(pe,ne){

			return ne.winsCount - pe.winsCount;

		})
		return res.json(winners);

	};

	Winners.find(selector,null,{},callback);


});

router.get('/',function(req,res,next){

	return res.render('winners', {
        title: "برندگان"
    });

});

module.exports = router;
