var mongoose = require('mongoose');
var _ = require('../helpers/_');

var Schema = mongoose.Schema;

// create a schema
var gameSchema = new Schema({
    gamer1: String,
    gamer2: String,
    gamerTurn: String,
    winner: String,
    startedAt: Date,
    gameLevel: String,
    gameType: String,
    data: Object,
    isFinished: Boolean,
    gamerPlayedAt: Date,
    lastTimePlayedGamer: String,
    gamerTimeout: Date,
    gamerTimeoutCount: Number,
    createdAt: Date,
    updatedAt: Date
});


gameSchema.pre('save', function (next) {

    this.updatedAt =  new Date;
    if (!this.createdAt) {
        this.createdAt = this.updatedAt;

        this.gamerTimeoutCount = 0;
    }

    if (!this.isFinished) {
        this.isFinished = false;
    }

    next();
});

var Game = mongoose.model('Game', gameSchema);


Game.getGameById = function (_id, callback) {
    Game.findOne({_id: _id}, function (err, game) {
        return callback(err, game);
    });
};


module.exports = Game;
