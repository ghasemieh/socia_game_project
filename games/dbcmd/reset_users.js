var MongoClient = require('mongodb').MongoClient;



MongoClient.connect('mongodb://superSuperAdmin:zv39-)0^E_RW(F-4fo@localhost:27017/online_games',{auth: {authdb: "admin"}}, function(err, db) {


	var res  = db.collection('users').find({}).toArray(function(err,data){

		
		data.sort((fe,ne)=>{

			return ne.winsCount - fe.winsCount;

		});

		// data.forEach(function (post) {
		
		// 	console.log(`ID = ${post._id} -> WIN COUNT = ${post.winsCount}`)

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
			"playsCount",
			"invitationCount",
			"hardSpentLife",
			"hardRemainedLife",
			"normalSpentLife",
			"normalRemainedLife",
			"easySpentLife",
			"easyRemainedLife",

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
//			console.log(settings)
			// db.collection('users').update(id,{

			// 	$set:settings

			// });

		});

		data.splice(4,data.length);

		data.forEach(function (post) {
		
			delete post._id;
			//db.collection('winners').update(post,post,{upsert:true});

		});





	});

});