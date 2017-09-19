var express = require('express');
var router = express.Router();
var _ = require("../helpers/_");

router.get('/', function (req, res, next) {
    res.render('index', {title: _.localize.translate("menuHome")});
});

module.exports = router;
