var mongoose = require('mongoose');
var _ = require('../helpers/_');

var Schema = mongoose.Schema;

// create a schema
var chargeSchema = new Schema({
    userId: String,
    price: Number,
    pack: Object,
    phone: String,
    gameType: String,
    gameLevel: String,
    status: String, // created, failed, done
    createdAt: Date,
    updatedAt: Date,
    uniqueId: String,
    transactionId: String,
    pin: String,
    dobBillingResponse: Object,
    dobPinConfirmationResponse: Object,
    billRequestSent: Boolean,
    message: String
});


chargeSchema.pre('save', function (next) {

    this.updatedAt = new Date;
    if (this.createdAt == null) {
        this.createdAt = this.updatedAt;
    }

    if (this.billRequestSent == null) {
        this.billRequestSent = false;
    }

    if (this.status == null) {
        this.status = "created";
    }

    if (this.message == null) {
        this.message = "";
    }

    next();
});

var Charge = mongoose.model('Charge', chargeSchema);


module.exports = Charge;
