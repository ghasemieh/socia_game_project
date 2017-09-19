var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var _ = require("../helpers/_");
var User = require("../models/User");


router.get('/', function (req, res, next) {

    return res.render('record', {
        title: "رکورد"
    });

});


router.post('/', function (req, res, next) {

    var topUsers = [];
    var yourRating = null;
    var winsCount = null;

    User.find(
        {},
        ['nickname', 'winsCount'],
        {
            skip: 0,
            limit: 10,
            sort: {
                winsCount: -1
            }
        },
        function (err, users) {

            if (err) {
                return res.json({
                    result: false,
                    message: 'خطا در بانک اطلاعاتی!'
                });
            }


            for (var i = 0; i < users.length; i++) {
                topUsers.push({
                    'nickname': users[i].nickname + "",
                    'winsCount': parseInt(users[i].winsCount) || 0
                });
            }

            var token = req.body._token;
            if (!token) {
                return res.json({
                    result: true,
                    topUsers: topUsers,
                    yourRating: yourRating,
                    winsCount: winsCount
                });
            }

            try {
                var _id = jwt.verify(token, _.jwtSecret)._doc._id;
            } catch (e) {
                return res.json({
                    result: true,
                    topUsers: topUsers,
                    yourRating: yourRating,
                    winsCount: winsCount
                });
            }

            if (!_id) {
                return res.json({
                    result: true,
                    topUsers: topUsers,
                    yourRating: yourRating,
                    winsCount: winsCount
                });
            }

            User.findOne({_id: _id}, function (err, user) {

                if (err) {
                    console.error(err);
                    return res.json({
                        result: false,
                        message: 'خطا در بانک اطلاعاتی!'
                    });
                }

                if (!user) {
                    return res.json({
                        result: true,
                        topUsers: topUsers,
                        yourRating: yourRating,
                        winsCount: winsCount
                    });
                }

                User.find({winsCount: {"$gt": user.winsCount}}).count(function (err, count) {

                    if (err) {
                        return res.json({
                            result: false,
                            message: 'خطا در بانک اطلاعاتی!'
                        });
                    }

                    yourRating = count + 1;

                    return res.json({
                        result: true,
                        topUsers: topUsers,
                        yourRating: yourRating,
                        winsCount: parseInt(user.winsCount)
                    });

                });

            });

        });
});

module.exports = router;
