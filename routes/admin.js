
//@mohammadhb ALL PAGE

var express = require('express');
var router = express.Router();

const ADMIN_USER_USERNAME = "___admin_panel_user";
const ADMIN_USER_PASSWORD = "___admin_panel_pass";

const admin_user = "root";
const admin_pass = "1234567890";

router.get('/',function(req,res,next){

	console.log("++++++++++++++++ ADMIN ENTERY GET ++++++++++++++");

	const cookie_username = req.cookies[ADMIN_USER_USERNAME];
	const cookie_password = req.cookies[ADMIN_USER_PASSWORD];

	if ( cookie_username == admin_user && cookie_password == admin_pass ) 

		return res.render('admin',{

			title:'ورود به سامانه'

		});

	//res.set('success',undefined);
	return res.render('admin-login',{

		title:'ورود به سامانه'

	});

});

router.post('/',function(req,res,next){

	console.log("++++++++++++++++ ADMIN ENTERY POST ++++++++++++++");

	//setting cookie on selected remember

	const remember = req.body.rememberMe ? true :false;
	let username = null;
	let password = null;

	const cookie_username = req.cookies[ADMIN_USER_USERNAME];
	const cookie_password = req.cookies[ADMIN_USER_PASSWORD];

	if ( cookie_username && cookie_password ) {

		username = cookie_username;
		password = cookie_password;

	} else {

		username = req.body.username;
		password = req.body.password;

	}

	console.log(username);
	console.log(password);

	if (username == admin_user && password == admin_pass) {

		if (remember && !(cookie_username&&cookie_username) ){

			res.cookie(ADMIN_USER_USERNAME,username);
			res.cookie(ADMIN_USER_PASSWORD,password);

		}

		res.set('success',true);

		return res.render('admin',{

			title:'ورود به سامانه'

		});

	}

	res.set('success',false);

	return res.render('admin-login',{

		title:'ورود به سامانه'

	});

});

let UserModel = require('../models/User');
let GameModel = require('../models/Game');

router.post('/info',function(req,res,next){

	todayDate = new Date();

	todayDate.setHours(0);
	todayDate.setMinutes(0);
	todayDate.setSeconds(0);


	let results = {

		plays:{

			today:-1,
			all:-1

		},

		users:{

			today:-1,
			all:-1

		},
		
		invites:{

			today:-1,
			all:-1

		}

	};

	UserModel.find({},function(err,allUsers){

		results.users.all=allUsers.length;

		UserModel.find({createdAt:{$gt:todayDate}},function(err,todayUsers){

			results.users.today=todayUsers.length;

			GameModel.find({},function(err,allGames){

				results.plays.all=allGames.length;

				GameModel.find({createdAt:{$gt:todayDate}},function(err,todayGames){

					results.plays.today=todayGames.length;

					UserModel.find({$nor:[{caller:null}]},function(err,allInvitedUsers){

						results.invites.all=allInvitedUsers.length;
						
						UserModel.find({$nor:[{caller:null}],createdAt:{$gt:todayDate}},function(err,todayInvitedUsers){

							results.invites.today=todayInvitedUsers.length;
							return res.json(results);
						
						})

					})

					
				})

				
			})


		})

		
	})

	//return res.json(results)

});

module.exports = router;
