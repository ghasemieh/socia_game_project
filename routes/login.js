var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");
var smsApi = require("../helpers/farapayamakApi");

var User = require('../models/User');


router.get('/', function (req, res, next) {
    res.render('login', {
        title: _.localize.translate("menuLogin"),
        caller: _.toString(req.query.caller)
    });
});


router.post('/', function (req, res, next) {

    // validate phone
    var phone = parseInt(_.toEnglish(req.body.phone));

    if (isNaN(phone)) {
        return res.render('login', {
            title: _.localize.translate("menuLogin"),
            caller: _.toString(req.body.caller),
            error: 'شماره فرستاده شده معتبر نیست!'
        });
    }

    if (phone < 9000000000 || phone > 9999999999) {
        return res.render('login', {
            title: _.localize.translate("menuLogin"),
            caller: _.toString(req.body.caller),
            error: 'مسابقه تنها برای همراه اولی‌هاست!'
        });
    }

    phone = phone.toString();
    phone = "+98" + phone.substr(phone.length - 10);


    // get user
    User.findOne({phone: phone}, function (err, user) {

        // get user
        if (!user) {
            return res.redirect('/register?error=registerFirst&phone=' + req.body.phone);
        }

        user._code = Math.floor(Math.random() * (9999 - 1000) + 1000) + "";
        user.save(function (err, user) {
            var message = "\n" + user._code +'کد زیر رو بزن واسه اینکه شمارت تایید شه:' ;
            smsApi.sendSmsNow(phone, message, function (err, body) {

                if (err) {
                    return res.render('login2', {
                        title: _.localize.translate("sendSms"),
                        phone: phone,
                        error: 'خطا در فرستادن پیامک!'
                    });
                }

                if (body.status === "ok") {
                    return res.render('login2', {
                        title: _.localize.translate("sendSms"),
                        phone: phone,
                        message: body.message
                    });

                }

                return res.render('login2', {
                    title: _.localize.translate("sendSms"),
                    phone: phone,
                    error: body.message
                });


            });
        });
    });
});


router.post('/code', function (req, res, next) {

    console.log("router.post('/code', function (req, res, next) {");

    // validate phone
    var _code = _.toEnglish(req.body.code);
    var phone = _.toEnglish(req.body.phone);

    // console.log("_code, phone");
    // console.log(_code);
    // console.log(phone);


    // User.findOne({phone: phone}, function (err, user) {
    User.findOne({phone: phone, _code: _code}, function (err, user) {

        if (err) {
            return res.render('error');
        }

        // get user
        if (!user) {
            return res.render('login2', {
                title: _.localize.translate("sendSms"),
                phone: phone,
                error: _.localize.translate("textIsWrong")
            });
        }


        var callerCharged = user.callerCharged;

        // update data
        if (!user.callerCharged) {
            user.callerCharged = true;
        }
        user._code = undefined;
        user.save(function (err, user) {

            // create token
            var token = jwt.sign(user, _.jwtSecret, {expiresIn: '600y'});


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

            if (!user.caller) {
                return res.render('setLocalStorage', {
                    title: _.localize.translate("sendSms"),
                    user: userData,
                    token: token
                });
            }

            if (callerCharged) {
                return res.render('setLocalStorage', {
                    title: _.localize.translate("sendSms"),
                    user: userData,
                    token: token
                });
            }

            // update user caller
            User.findOne({_id: user.caller}, function (err, caller) {

                console.log(__filename + ", err", err);
                console.log(__filename + ", caller", caller);

                if (err) {
                    return res.render('setLocalStorage', {
                        title: _.localize.translate("sendSms"),
                        user: userData,
                        token: token
                    });
                }


                if (!caller) {
                    return res.render('setLocalStorage', {
                        title: _.localize.translate("sendSms"),
                        user: userData,
                        token: token
                    });
                }


                caller.invitationCount = (parseInt(caller.invitationCount) || 0) + 1;
                caller.easyRemainedLife = (parseInt(caller.easyRemainedLife) || 0) + 1;

                //@mohammadhb adding 10 points for invitations

                console.log("))))))))))))))))))) caller's name is :",caller.nickname);
                console.log("))))))))))))))))))) caller's name is :",caller.invitations);
                console.log("))))))))))))))))))) caller's first leather name is :",caller.nickname[0]);

                if (caller.nickname[0] == '_') {

                    caller.invitations.push(userData._id)

                } else {

                    caller.winsCount+= 10;
                        
                }
                


                caller.save(function (err, caller) {


                    console.log(__filename + ", err2", err);
                    console.log(__filename + ", caller2", caller);

                    if (err) {
                        return res.render('setLocalStorage', {
                            title: _.localize.translate("sendSms"),
                            user: userData,
                            token: token
                        });
                    }

                    var message = 'بابت دعوت از کاربر ' + user.nickname + ' ۱۰ امتیاز هدیه گرفتی.';

                    smsApi.sendSmsNow(caller.phone, message, function (err, body) {
                    });

                    return res.render('setLocalStorage', {
                        title: _.localize.translate("sendSms"),
                        user: userData,
                        token: token
                    });

                });

            });

        });

    });
});


module.exports = router;
