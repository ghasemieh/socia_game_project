var mongoose = require('mongoose');

mongoose.Promise = global.Promise;


var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    phone: {type: String, required: true, unique: true},
    _code: String,
    nickname: String,
    approve_rules: String,
    caller: String,
    callerCharged: {
        type: Boolean,
        default: false
    },
    lastPlayedAt: Date,
    userLevels: Object, // easy, normal, hard
    gameType: String,
    gameLevel: String,
    isPlaying: String,
    gameId: String,
    wins: Array,
    loses: Array,
    socketId: String,
    createdAt: Date,
    updatedAt: Date,
    easyRemainedLife: Number,
    easySpentLife: Number,
    normalRemainedLife: Number,
    normalSpentLife: Number,
    hardRemainedLife: Number,
    hardSpentLife: Number,
    playsCount: Number,
    winsCount: Number,
    gamesResults: Object,
    invitations: Array,
    invitationCount: Number,
    _data: Object
});


userSchema.pre('save', function (next) {

    this.updatedAt = new Date;

    if (!this.createdAt) {

        this.createdAt = this.updatedAt;

        // userLevels
        this.userLevels = {};

        // life
        this.easyRemainedLife = 1;
        this.easySpentLife = 0;

        this.normalRemainedLife = 0;
        this.normalSpentLife = 0;

        this.hardRemainedLife = 0;
        this.hardSpentLife = 0;


        // count
        this.playsCount = 0;
        this.winsCount = 0;


        // invitation
        this.invitationCount = 0;


        // games results
        this.gamesResults = {};

    }


    var shouldUpdateUser = false;


    var userLevels = this.userLevels;
    var gamesResults = this.gamesResults;

    // xo configuration
    if (!userLevels.xo || userLevels.xo.length === 0) {
        shouldUpdateUser = true;
        userLevels.xo = [];
        userLevels.xo.push('easy');
    }
    if (!gamesResults.xo) {
        shouldUpdateUser = true;
        gamesResults.xo = {
            easy: {playsCount: 0, winsCount: 0},
            normal: {playsCount: 0, winsCount: 0},
            hard: {playsCount: 0, winsCount: 0}
        };
    }


    // dot configuration
    if (!userLevels.dot || userLevels.dot.length === 0) {
        shouldUpdateUser = true;
        userLevels.dot = [];
        userLevels.dot.push('easy');
    }
    if (!gamesResults.dot) {
        shouldUpdateUser = true;
        gamesResults.dot = {
            easy: {playsCount: 0, winsCount: 0},
            normal: {playsCount: 0, winsCount: 0},
            hard: {playsCount: 0, winsCount: 0}
        };
    }


    // card configuration
    if (!userLevels.card || userLevels.card.length === 0) {
        shouldUpdateUser = true;
        userLevels.card = [];
        userLevels.card.push('easy');
    }
    if (!gamesResults.card) {
        shouldUpdateUser = true;
        gamesResults.card = {
            easy: {playsCount: 0, winsCount: 0},
            normal: {playsCount: 0, winsCount: 0},
            hard: {playsCount: 0, winsCount: 0}
        };
    }


    // battleship configuration
    if (!userLevels.battleship || userLevels.battleship.length === 0) {
        shouldUpdateUser = true;
        userLevels.battleship = [];
        userLevels.battleship.push('easy');
    }
    if (!gamesResults.battleship) {
        shouldUpdateUser = true;
        gamesResults.battleship = {
            easy: {playsCount: 0, winsCount: 0},
            normal: {playsCount: 0, winsCount: 0},
            hard: {playsCount: 0, winsCount: 0}
        };
    }


    // remove ship
    if (userLevels.hasOwnProperty('ship')) {
        shouldUpdateUser = true;
        delete userLevels['ship'];
    }
    if (gamesResults.hasOwnProperty('ship')) {
        shouldUpdateUser = true;
        delete gamesResults['ship'];
    }

    if (shouldUpdateUser) {
        this.userLevels = {};
        this.userLevels = userLevels;
        this.gamesResults = {};
        this.gamesResults = gamesResults;
    }

    if (!this._data) this._data = {};

    next();
});

var User = mongoose.model('User', userSchema);


User.getUserById = function (_id, callback) {
    User.findOne({_id: _id}, function (err, user) {
        return callback(err, user);
    });
};


User.getUserBySocketId = function (socketId, callback) {
    User.findOne({socketId: socketId}, function (err, user) {
        return callback(err, user);
    });
};


User.getUserBySocketId = function (socketId, callback) {
    User.findOne({socketId: socketId}, function (err, user) {
        return callback(err, user);
    });
};


module.exports = User;
