var express = require('express');
var router = express.Router();
var _ = require("../helpers/_");

router.get('/', function (req, res, next) {
    res.render('logout', {title: _.localize.translate("menuLogout")});
});

module.exports = router;
