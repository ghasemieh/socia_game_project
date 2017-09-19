var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");

var User = require('../models/User');
var Charge = require('../models/Charge');

router.post('/me', function (req, res, next) {

    console.log("router.post('/me', function (req, res, next) {");


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
            message: 'اطلاعات کاربر فرستاده شد.',
            data: {user: userData}
        });

    });

});


router.post('/my-payments', function (req, res, next) {

    console.log("router.post('/my-payments', function (req, res, next) {");


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

        var i, charge, charges = [];

        var conditions = {
            'status': "done",
            'userId': user._id.toString()
        };

        Charge.find(conditions, null, {sort: {createdAt: -1}, limit: 20}, function (err, userCharges) {

            for (i = 0; i < userCharges.length; i++) {
                charge = {
                    createdAt: userCharges[i].createdAt,
                    gameLevel: userCharges[i].gameLevel,
                    price: (parseInt(userCharges[i].price) || 0)
                };

                charges.push(charge);
            }

            return res.json({
                result: true,
                message: 'لیست پرداختی‌های کاربر فرستاده شد.',
                data: {charges: charges}
            });

        });


    });

});


module.exports = router;
