var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");
var smsApi = require("../helpers/farapayamakApi");

var User = require('../models/User');


router.get('/', function (req, res, next) {

    var warning = null;
    if (req.query.error === 'registerFirst') {
        warning = 'ابتدا نام‌نویسی فرمایید!';
    }

    return res.render('register', {
        title: _.localize.translate("menuRegister"),
        data: {
            caller: _.toString(req.query.caller),
            phone: _.toString(req.query.phone),
            nickname: "",
            approve_rules: ""
        },
        warning: warning
    });
});


router.post('/', function (req, res, next) {

    // get data
    var data = {
        phone: parseInt(_.toEnglish(req.body.phone)),
        nickname: _.toString(req.body.nickname),
        approve_rules: _.toString(req.body.approve_rules),
        caller: _.toString(req.body.caller)
    };

    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>Data in register>>>>>>>>`,data);

    // check phone
    if (isNaN(data.phone)) {
        data.phone = "";
        return res.render('register', {
            title: _.localize.translate("menuRegister"),
            error: 'شماره فرستاده شده معتبر نیست!',
            data: data
        });
    }

    if (data.phone > 980000000000) {
        data.phone = data.phone - 980000000000;
    }
    
    if (data.phone < 9000000000 || data.phone > 9999999999) {
        return res.render('register', {
            title: _.localize.translate("menuRegister"),
            error: 'شماره فرستاده شده معتبر نیست!',
            data: data
        });
    }
    data.phone = data.phone.toString();
    data.phone = "+98" + data.phone.substr(data.phone.length - 10);


    // check nickname
    if (!_.checkNickname(data.nickname)) {
        return res.render('register', {
            title: _.localize.translate("menuRegister"),
            error: 'نام مستعار باید تنها شامل حروف انگلیسی، اعداد و یا _ باشد!',
            data: data
        });
    }


    // get user by
    User.findOne({$or: [{'phone': data.phone},  {'nickname': {$regex: new RegExp(data.nickname, "i")}}]}, function (err, user) {


        // check phone
        if (user) {

            if (user.phone === data.phone && user.nickname === data.nickname) {

                var message =  user._code + "\n" + 'این کد رو بزن واسه اینکه شمارت تایید شه';
                smsApi.sendSmsNow(data.phone, user._code, function (err, body) {})

                return res.render('login2', {
                    title: _.localize.translate("menuRegister"),
                    error: 'شما پیش‌تر با این شماره همراه و نام مستعار نام‌نویسی کرده‌اید!',
                    phone: data.phone
                });
            }

            if (user.phone === data.phone) {
                return res.render('login2', {
                    title: _.localize.translate("menuRegister"),
                    error: 'شما پیش‌تر با این شماره همراه نام‌نویسی کرده‌اید!',
                    phone: data.phone
                });
            }

            return res.render('register', {
                title: _.localize.translate("menuRegister"),
                error: 'این نام مستعار پیش‌تر ثبت شده است! نام مستعار دیگری انتخاب فرمایید.',
                data: data
            });
        }


        user = new User();
        user.phone = data.phone;
        user.nickname = data.nickname;
        user.approve_rules = data.approve_rules;

        User.findOne({nickname: data.caller}, function (err, caller) {

            if (!err && caller) {
                user.caller = caller._id.toString();
            }

            user._code = Math.floor(Math.random() * (9999 - 1000) + 1000) + "";
            user.save(function (err, user) {
            

                // should be removed - start
                // return res.render('login2', {
                //     title: _.localize.translate("sendSms"),
                //     phone: data.phone,
                //     message: 'پیامک فرستاده شد.'
                // });
                // should be removed - end
                var message =  user._code + "\n" + 'این کد رو بزن واسه اینکه شمارت تایید شه';
                smsApi.sendSmsNow(data.phone, message, function (err, body) {

                    if (err) {
                        return res.render('login2', {
                            title: _.localize.translate("sendSms"),
                            phone: data.phone,
                            error: 'خطا در فرستادن پیامک!'
                        });
                    }


                    if (body['status'] === 'ok') {
                        return res.render('login2', {
                            title: _.localize.translate("sendSms"),
                            phone: data.phone,
                            message: 'پیامک فرستاده شد.'
                        });
                    }

                    return res.render('register', {
                        title: _.localize.translate("menuRegister"),
                        error: 'پیامک ارسال نشد!',
                        data: data
                    });

                });
            });
        });


    });
});


module.exports = router;
