var dobApi = require('../helpers/dobApi');
var uuid = require('node-uuid');
var mongoose = require('mongoose');


// load models
var User = require('../models/User');
var Game = require('../models/Game');
var Charge = require('../models/Charge');


/**
 * main helper
 * @private
 */
_ = function () {

	/**
	 * jwt secret key
	 * @type {string}
	 */
	this.jwtSecret = 'vw489tcn1o3rxy34rxt3@£TG@£gprxm34p9cwed4c36BE4pvbqc23cr7x3G%$£H$CSdf45nrox348ln874rt';


	/**
	 * localize
	 * @type {*}
	 */
	this.localize = require('../localize/localize');


	/**
	 * available games
	 * @type {[*]}
	 */
	this.availableGames = {

		xo: {
			levels: {
				easy: {
					available: true,
					href: '/play/xo/easy',
					title: 'ساده'
				}
			},
			startAt: new Date("2016-07-10T12:00:00.000Z"),
			finishAt: new Date("2018-07-10T12:15:00.000Z"),
			available: true
		},


		dot: {
			levels: {
				easy: {
					available: true,
					href: '/play/dot/easy',
					title: 'ساده'
				},
				normal: {
					available: false,
					href: '/play/dot/normal',
					title: 'متوسط'
				},
				hard: {
					available: false,
					href: '/play/dot/hard',
					title: 'سخت'
				}
			},
			startAt: new Date("2016-07-10T12:15:00.000Z"),
			finishAt: new Date("2018-07-10T12:30:00.000Z"),
			available: true
		},


		card: {
			levels: {
				easy: {
					available: true,
					href: '/play/card/easy',
					title: 'ساده'
				},
				normal: {
					available: false,
					href: '/play/card/normal',
					title: 'متوسط'
				},
				hard: {
					available: false,
					href: '/play/card/hard',
					title: 'سخت'
				}
			},
			startAt: new Date("2016-07-10T12:30:00.000Z"),
			finishAt: new Date("2018-07-10T12:45:00.000Z"),
			available: true
		},


		battleship: {
			levels: {
				easy: {
					available: true,
					href: '/play/battleship/easy',
					title: 'ساده'
				},
				normal: {
					available: false,
					href: '/play/battleship/normal',
					title: 'متوسط'
				},
				hard: {
					available: false,
					href: '/play/battleship/hard',
					title: 'سخت'
				}
			},
			startAt: new Date("2016-07-10T12:45:00.000Z"),
			finishAt: new Date("2018-07-10T13:00:00.000Z"),
			available: false
		}
	}
};


/**
 *
 * @param gameType
 * @param gameLevel
 * @returns {boolean}
 */
_.prototype.isGameAvailable = function (gameType, gameLevel) {

	var game = this.availableGames[gameType];
	var now = new Date();

	var gameIsAvailable = false;
	if (game.available === true && game.levels[gameLevel].available === true && game.startAt <= now && game.finishAt >= now) {
		gameIsAvailable = true;
	}

	return gameIsAvailable;
};


/**
 *
 * @param socketId
 * @returns {Function}
 */
_.prototype.resetSocketId = function (socketId) {

	return function () {

		User.update(

			{

				socketId: socketId
				
			}, 

			{
				$set: {

					socketId: null,
					_data: {}

				}
			},

			{

				multi: true

			},

			function () {

				return true;

			}

		);

	}
};


/**
 *
 * @param x
 * @param min
 * @param max
 * @returns {boolean}
 */
_.prototype.between = function (x, min, max) {
	return x >= min && x <= max;
};


/**
 * save|update socketId
 * @param socket
 * @param callback
 */
_.prototype.updateSocketId = function (socket, callback) {

	var _id = socket['decoded_token']._doc._id;

	User.getUserById(_id, function (err, user) {

		if (err) return callback(err, null);
		if (!user) return callback(null, user);

		user.socketId = socket.id;
		user.save(function (err, user) {
			return callback(err, user);
		});
	});
};


_.prototype.addSeconds = function (date, seconds) {
	return new Date(date.getTime() + seconds * 1000);
};


_.prototype.diffTimeInSecond = function (t1, t2) {
	var dif = t1.getTime() - t2.getTime();
	return Math.abs(parseInt(dif / 1000));
};


// err, hasCharged
_.prototype.hasCharge = function (user, callback) {

	// user previous charges
	var leftOverLife = parseInt(user[user.gameLevel + "RemainedLife"]);
	if (leftOverLife > 0) {
		return callback(null, true);
	}
	return callback(null, false);
};


// err, user, charge
_.prototype.makeCharge = function (user, callback) {

	// get latest unpaid charge
	Charge.findOne({
		userId: user._id,
		gameType: user.gameType,
		gameLevel: user.gameLevel,
		status: "created"
	}, function (err, charge) {
		if (err) return callback(err);

		if (charge) {
			return callback(null, user, charge);
		}

		charge = new Charge;
		charge.userId = user._id;
		charge.phone = user.phone;
		charge.gameType = user.gameType;
		charge.gameLevel = user.gameLevel;
		charge.uniqueId = uuid.v1();

		dobApi.sendBillingRequest(charge, function (err, billingResponse) {

			if (err) return callback(err);

			charge.dobBillingResponse = billingResponse;
			charge.billRequestSent = (parseInt(billingResponse.Response) === 1);
			charge.transactionId = billingResponse.Data.TransactionID;

			charge.save(function (err, charge) {
				return callback(err, user, charge);
			});
		});
	});

};


_.prototype.makeNewCharge = function (user, pack, callback) {

	var charge = new Charge;
	charge.userId = user._id;
	charge.price = pack.price;
	charge.pack = pack;
	charge.phone = user.phone;
	charge.gameType = user.gameType;
	charge.gameLevel = user.gameLevel;
	charge.uniqueId = uuid.v1();

	dobApi.sendBillingRequest(charge, function (err, billingResponse) {

		if (err) return callback(err);

		charge.dobBillingResponse = billingResponse;
		charge.billRequestSent = (parseInt(billingResponse.Response) === 1);
		charge.transactionId = billingResponse.Data.TransactionID;

		charge.save(function (err, charge) {
			return callback(err, user, charge);
		});
	});

};


// err, user, hasCharged, charge
_.prototype.sendPinConfirmation = function (user, uniqueId, pin, transactionId, callback) {

	pin = this.toEnglish(pin);

	Charge.findOne({
		userId: user._id,
		gameType: user.gameType,
		gameLevel: user.gameLevel,
		phone: user.phone,
		uniqueId: uniqueId,
		transactionId: transactionId,
		status: "created"
	}, function (err, charge) {

		if (err) return callback(err);
		if (!charge) return callback("chargeNotFound");


		dobApi.sendPinConfirmation(charge, pin, function (err, body) {

			charge.dobPinConfirmationResponse = body;
			charge.pin = pin;

			var hasCharged = false;
			charge.message = "dobApiMsg" + body.Response;

			if (parseInt(body.Response) === 1 && parseInt(body.Data.Result) === 1) {
				hasCharged = true;
				charge.message = "";
				charge.status = "done";
			}


			if (parseInt(body.Data.Result) === 0) {
				charge.status = "failed";
				charge.message = "paymentFailed";
			}

			charge.save(function (err, charge) {

				if (err) return callback(err);

				if (charge.status !== "done") {
					return callback(err, user, hasCharged, charge);
				}

				var remainedLifeKey = user.gameLevel + "RemainedLife";
				user[remainedLifeKey] = parseInt(user[remainedLifeKey]) + 1;

				user.save(function (err, user) {
					return callback(err, user, true, charge);
				});

			});

		});

	});

};


/**
 * confirm charge
 * @param user
 * @param uniqueId
 * @param pin
 * @param transactionId
 * @param callback
 */
_.prototype.confirmCharge = function (user, uniqueId, pin, transactionId, callback) {

	pin = this.toEnglish(pin);

	Charge.findOne({
		userId: user._id,
		phone: user.phone,
		uniqueId: uniqueId,
		transactionId: transactionId,
		status: "created"
	}, function (err, charge) {

		if (err) return callback(err);
		if (!charge) return callback("chargeNotFound");


		dobApi.sendPinConfirmation(charge, pin, function (err, body) {

			charge.dobPinConfirmationResponse = body;
			charge.pin = pin;

			var hasCharged = false;
			charge.message = "dobApiMsg" + body.Response;

			if (parseInt(body.Response) === 1 && parseInt(body.Data.Result) === 1) {
				hasCharged = true;
				charge.message = "";
				charge.status = "done";
			}


			if (parseInt(body.Data.Result) === 0) {
				charge.status = "failed";
				charge.message = "paymentFailed";
			}

			charge.save(function (err, charge) {

				if (err) return callback(err);

				if (charge.status !== "done") {
					return callback(err, user, hasCharged, charge);
				}

				user.easyRemainedLife = parseInt(user.easyRemainedLife) + parseInt(charge.pack.easyLife);
				user.normalRemainedLife = parseInt(user.normalRemainedLife) + parseInt(charge.pack.normalLife);
				user.hardRemainedLife = parseInt(user.hardRemainedLife) + parseInt(charge.pack.hardLife);

				user.save(function (err, user) {

					if (err) {
						return callback(err);
					}

					return callback(err, user, true, charge);
				});

			});

		});

	});

};


/**
 *
 * @param io
 * @param socket
 * @param err
 * @returns {*}
 */
_.prototype.sendError = function (io, socket, err) {

	if (!socket) {
		return true;
	}

	return io.to(socket.id).emit('error', err);

	// return io.to(socket.id).emit('error');
};


_.prototype.isInt = function (value) {
	return !isNaN(value) &&
		parseInt(Number(value)) === value && !isNaN(parseInt(value, 10));
};


_.prototype.isSet = function (dataArray, i, j) {
	return (dataArray[i] !== undefined && dataArray[i][j] !== undefined);
};


_.prototype.toString = function (string) {
	if (typeof string !== "string") {
		string = '';
	}
	return string;
};


_.prototype.shuffleArray = function (array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};


_.prototype.toEnglish = function (string) {

	if (typeof string !== 'string') {
		return string;
	}

	string = string.replace(new RegExp('۰', 'g'), '0');
	string = string.replace(new RegExp('۱', 'g'), '1');
	string = string.replace(new RegExp('۲', 'g'), '2');
	string = string.replace(new RegExp('۳', 'g'), '3');
	string = string.replace(new RegExp('۴', 'g'), '4');
	string = string.replace(new RegExp('۵', 'g'), '5');
	string = string.replace(new RegExp('۶', 'g'), '6');
	string = string.replace(new RegExp('۷', 'g'), '7');
	string = string.replace(new RegExp('۸', 'g'), '8');
	return string.replace(new RegExp('۹', 'g'), '9');
};


_.prototype.checkNickname = function (nickname) {
	var re = /^\w+$/;

	if (nickname.length === 0) {
		return false;
	} else if (!re.test(nickname)) {
		return false;
	}
	return true;
};


/**
 *
 * @param gameType
 * @returns {*}
 */
_.prototype.gameCoreByGameType = function (gameType) {

	var gameLib = null;

	switch (gameType) {
		case 'xo':
			gameLib = require('../games/xo/xo');
			break;
		case 'dot':
			gameLib = require('../games/dot/dot');
			break;
		case 'card':
			gameLib = require('../games/card/card');
			break;
		case 'battleship':
			gameLib = require('../games/battleship/battleship');
			break;
	}

	return gameLib;
};


_.prototype.gamersByGame = function (game, callback) {

	console.log(__filename + ', _.prototype.gamersByGame');

	var Ids = [
		game.gamer1,
		game.gamer2
	];

	User.find({_id: {$in: Ids}}, function (err, gamers) {

		if (gamers.length !== 2) {
			gamers = null;
		}

		return callback(err, gamers);
	});
};


module.exports = new _;
