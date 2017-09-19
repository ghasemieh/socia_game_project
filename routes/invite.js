var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");
var User = require("../models/User");
var smsApi = require("../helpers/farapayamakApi");


router.post('/', function (req, res, next) {

    var token = req.body._token;
    if (!token) {
        return res.json({
            result: false,
            message: 'خطا! شناسه کاربر فرستاده نشده است!'
        });
    }


    // validate phone
    var phone = parseInt(_.toEnglish(req.body.phone));
    if (!phone) {
        return res.json({
            result: false,
            message: 'شماره فرستاده شده معتبر نیست!'
        });
    }

    if (isNaN(phone)) {
        return res.json({
            result: false,
            message: 'شماره فرستاده شده معتبر نیست!'
        });
    }

    if (phone < 9000000000 || phone > 9999999999) {
        return res.json({
            result: false,
            message: 'شماره فرستاده شده معتبر نیست!' + " " + 'مسابقه تنها برای همراه اولی‌هاست.'
        });
    }

    phone = phone.toString();
    phone = "+98" + phone.substr(phone.length - 10);


    try {
        var userId = jwt.verify(token, _.jwtSecret)._doc._id;
    } catch (e) {
        return res.json({
            result: false,
            message: 'خطا! شناسه کاربر معتبر نیست!'
        });
    }


    User.findById(userId, function (err, user) {

        if (err || !user) {
            return res.json({
                result: false,
                message: 'خطا! کاربر یافت نشد!'
            });
        }


        User.findOne({phone: phone}, function (err, guest) {

            if (err) {
                return res.json({
                    result: false,
                    message: 'خطا! در واکشی اطلاعات کاربر!'
                });
            }

            if (guest) {
                return res.json({
                    result: false,
                    message: 'خطا! کاربر با شماره' + " " + req.body.phone + " " + "پیش‌تر در این بازی عضو شده است!"
                });
            }

            var message = 'کاربر با نام مستعار' + " " + user.nickname + " " + "و شماره همراه" + " " + user.phone + " " + "شما را به بازی در سایت ما دعوت کرده است.";
            message += "\n";
            message += "برای پذیرش دعوت روی لینک زیر کلیک کرده و نام‌نویسی کنید:";
            message += "\n";
            message += "http://moliran.com/register?nickname=" + user.nickname;
            message += "\n\n";
            smsApi.sendSmsNow(phone, message, function (err, result) {

                if (err) {
                    return res.json({
                        result: false,
                        message: "خطا هنگام فرستادن پیامک!"
                    });
                }

                return res.json({
                    result: true,
                    message: "پیامک دعوت بدون هزینه فرستاده شد."
                });
            });

        });

    })
});

module.exports = router;
