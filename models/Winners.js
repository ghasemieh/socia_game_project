var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var winnersSchema = new Schema({
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


var Winners = mongoose.model('Winners', winnersSchema);

module.exports = Winners;
