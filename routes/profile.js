var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");

var User = require("../models/User");

router.get('/', function (req, res, next) {
    res.render('profile', {title: _.localize.translate("menuProfile")});
});


// @mohammadhb : not used
router.post('/set-nickname', function (req, res, next) {

    console.log("router.post('/set-nickname', function (req, res, next) {");
    console.log(_.toEnglish(req.body.nickname));

    var token = req.body._token;

    var _id = jwt.verify(token, _.jwtSecret)._doc._id;
    User.findOne({_id: _id}, function (err, user) {

        if (err) {
            return res.json({
                result: false,
                message: 'خطا در بانک اطلاعاتی!'
            });
        }

        if (!user) {
            return res.json({
                result: false,
                message: 'کاربر یافت نشد!'
            });
        }


        if (typeof(user.nickname) === 'string' && user.nickname !== '') {
            return res.json({
                result: false,
                message: 'تنها یکبار می‌توانید نام مستعار انتخاب کنید!'
            });
        }


        var nickname = req.body.nickname + "";
        if (nickname === "") {
            return res.json({
                result: false,
                message: 'برای ادامه کار نام مستعار را وارد نمایید!'
            });
        } else if (!/^([a-zA-Z0-9_]+)$/.test(nickname)) {
            return res.json({
                result: false,
                message: 'تنها از حروف انگلیسی و _ میتوانید برای نام کاربری استفاده نمایید!'
            });
        }

        user.nickname = nickname;
        user.save(function (err, user) {
            if (err) return res.render('error', err);

            var userData = {};
            userData._id = user._id;
            userData.phone = user.phone;
            userData.nickname = (user.nickname === undefined) ? null : user.nickname;
            userData.userLevels = user.userLevels;


            return res.json({
                result: true,
                message: 'نام مستعار با موفقیت ذخیره شد.',
                data: {
                    token: token,
                    user: userData
                }
            });

        });
    });
});


// @mohammadhb : token -> get user
router.post('/profile-data', function (req, res, next) {

    var token = req.body._token;

    var _id = jwt.verify(token, _.jwtSecret)._doc._id;
    User.getUserById(_id, function (err, user) {

        if (err) {
            return res.json({
                result: false,
                message: 'خطا در بانک اطلاعاتی!'
            });
        }

        if (!user) {
            return res.json({
                result: false,
                message: 'کاربر یافت نشد!'
            });
        }


        User.find({caller: user._id}, function (err, users) {

            if (err) {
                return res.json({
                    result: false,
                    message: 'خطا در بانک اطلاعاتی!'
                });
            }

            var invitees = [];
            for (var i = 0; i < users.length; i++) {
                invitees.push({
                    _id: users[i]._id,
                    nickname: users[i].nickname
                });
            }


            var inviteLink = req.protocol + '://' + req.get('host') + '/register?nickname=' + user.nickname;

            var gamesResults = user.gamesResults;
            if (gamesResults.xo) gamesResults.xo.title = 'بازی ایکس‌او';
            if (gamesResults.dot) gamesResults.dot.title = 'بازی نقطه‌خط';
            if (gamesResults.card) gamesResults.card.title = 'بازی کارت‌حافظه';
            if (gamesResults.battleship) gamesResults.battleship.title = 'بازی کشتی‌جنگی';

            var data = {
                _id: user._id,
                nickname: user.nickname,
                userLevels: user.userLevels,
                easyRemainedLife: parseInt(user.easyRemainedLife) || 0,
                easySpentLife: parseInt(user.easySpentLife) || 0,
                normalRemainedLife: parseInt(user.normalRemainedLife) || 0,
                normalSpentLife: parseInt(user.normalSpentLife) || 0,
                hardRemainedLife: parseInt(user.hardRemainedLife) || 0,
                hardSpentLife: parseInt(user.hardSpentLife) || 0,
                playsCount: parseInt(user.playsCount) || 0,
                winsCount: parseInt(user.winsCount) || 0,
                gamesResults: gamesResults,
                invitees: invitees,
                inviteLink: inviteLink
            };


            return res.json({
                result: true,
                message: 'اطلاعات فرستاده شد.',
                data: data
            });

        });


    });
});


module.exports = router;
