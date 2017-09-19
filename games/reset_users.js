const smsApi = require('../helpers/farapayamakApi.js');
let scheduler = require('node-schedule');


var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://superSuperAdmin:zv39-)0^E_RW(F-4fo@localhost:27017/online_games',{auth: {authdb: "admin"}}, function(err, db) {

	var res  = db.collection('users').find({}).toArray(function(err,data){

		
		data.sort((fe,ne)=>{

			return ne.winsCount - fe.winsCount;

		});

		// data.forEach(function (post) {
		
		//  console.log(`ID = ${post._id} -> WIN COUNT = ${post.winsCount}`)

		// });

		let games = [
			"xo",
			"dot",
			"card"
		];

		const difficulties = [
			"easy",
			"normal",
			"hard"
		];

		let attributes = [
			"winsCount",
		];

		let settings = {};

		for (let game in games) {

			for ( let difficulty in difficulties ) {

				settings[`gamesResults.${games[game]}.${difficulties[difficulty]}.winsCount`] = 0;
				settings[`gamesResults.${games[game]}.${difficulties[difficulty]}.playsCount`] = 0;

			}

		};

		for (let attribute in attributes) {

			settings[`${attributes[attribute]}`] = 0;

		};

		settings["invitations"] = [];
		settings["loses"] = [];
		settings["wins"] = [];


		data.forEach(function (post) {
		
			let id = {_id:post._id};
			db.collection('users').update(id,{

			 $set:settings

			});

		});

		data.splice(4,data.length);

		var broadcasts = `Date : ${new Date()}\n`;;

		data.forEach(function (post,index) {
		
			delete post._id;

			broadcasts +="-----------------------\n"

			broadcasts += `Rank ${index+1}\n`;
			broadcasts += `Nickname ${post.nickname}\n`;
			broadcasts += `Phone ${post.phone}\n`;

			db.collection('winners').update(post,post,{upsert:true});

		});

		console.log(broadcasts)

		smsApi.sendSmsNow("+989012431060",broadcasts,function(err,res){

			console.log(res);

		});

	});

});