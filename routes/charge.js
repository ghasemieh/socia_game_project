var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");

var User = require('../models/User');


var packs = {
    3: {
        id: 3,
        price: 200,
        easyLife: 1,
        normalLife: 0,
        hardLife: 0
    },
    7: {
        id: 7,
        price: 2000,
        easyLife: 12,
        normalLife: 0,
        hardLife: 0
    }
};


router.get('/', function (req, res, next) {
    res.render('charge', {
        title: "شارژ حساب"
    });
});


router.post('/buy/:packageId', function (req, res, next) {

    console.log("router.post('/buy/:packageId', function (req, res, next) {");

    var packageId = parseInt(req.params.packageId);
    if (isNaN(packageId)) {
        res.json({
            result: false,
            message: 'شناسه بسته نامعتبر است!'
        });
    }

    if (!packs.hasOwnProperty(packageId)) {
        res.json({
            result: false,
            message: 'شناسه بسته نامعتبر است!'
        });
    }

    var pack = packs[packageId];


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


        // make charge
        _.makeNewCharge(user, pack, function (err, user, charge) {

            if (err) {
                return res.json({
                    result: false,
                    message: 'خطا در ایجاد درخوسات خرید!'
                });
            }

            if (charge.billRequestSent) {

                return res.json({
                    result: true,
                    message: 'پیامک شارژ فرستاده شد.',
                    data: {
                        uniqueId: charge.uniqueId,
                        transactionId: charge.transactionId
                    }
                });
            }


            return res.json({
                result: false,
                message: 'خطا در درخواست شارژ حساب!'
            });
        });

    });

});


router.post('/pay', function (req, res, next) {

    console.log("router.post('/pay', function (req, res, next) {");

    var uniqueId = req.body.uniqueId;
    var transactionId = req.body.transactionId;
    var pin = req.body.pin;

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


        // confirm the charge
        _.confirmCharge(user, uniqueId, pin, transactionId, function (err, user, charge) {

            if (err) {
                return res.json({
                    result: false,
                    message: 'خطا در بررسی پین‌کد کاربر!'
                });
            }

            if (!charge) {
                return res.json({
                    result: false,
                    message: 'خطایی رخ داد! حساب شارژ نشد.'
                });
            }

            var userData = {};
            userData._id = user._id;
            userData.phone = user.phone;
            userData.nickname = (user.nickname === undefined) ? null : user.nickname;
            userData.userLevels = user.userLevels;

            userData.easyRemainedLife = user.easyRemainedLife;
            userData.easySpentLife = user.easySpentLife;

            userData.normalRemainedLife = user.normalRemainedLife;
            userData.normalSpentLife = user.normalSpentLife;

            userData.hardRemainedLife = user.hardRemainedLife;
            userData.hardSpentLife = user.hardSpentLife;

            userData.playsCount = user.playsCount;
            userData.winsCount = user.winsCount;

            return res.json({
                result: true,
                message: 'حساب شما با موفقیت شارژ شد.',
                data: {user: userData}
            });

        });

    });

});


router.post('/get-free', function (req, res, next) {

    console.log("router.post('/get-free', function (req, res, next) {");

    var userId = req.body.id;

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

        if (!userId) {
            if (user.easyRemainedLife === 0) {
                user.easyRemainedLife += 5;
                user.save(function () {
                    return res.json({
                        result: true,
                        message: 'حساب شما شارژ شد.'
                    });
                });
            } else {
                return res.json({
                    result: false,
                    message: 'شما شارژ دارید! برای دریافت هدیه باید شارژتان تمام شده باشد.'
                });
            }
        } else {
            User.getUserById(userId, function (err, user) {
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

                user.easyRemainedLife += 5;
                user.save(function () {
                    return res.json({
                        result: true,
                        message: 'حساب ' + user.nickname + ' شارژ شد.'
                    });
                });

            });
        }

    });

});


module.exports = router;
