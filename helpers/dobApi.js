var request = require("request");
var dobApi = {};


dobApi.baseUrl = 'https://dobapi.verabehinarman.com/';


dobApi.headers = {
    'merchantid': '15',
    'user': 'SociaSoft',
    'password': 'ATdM74~ZLj^Gz-@9'
};


// err, hasSent, charge
dobApi.sendBillingRequest = function (charge, callback) {

    console.log('dobApi.sendBillingRequest = function (charge, callback) {');

    var phone = charge.phone;
    var uniqueId = charge.uniqueId;
    var serviceid = '';

    if (charge.gameLevel == 'easy') {
        serviceid = '29';
    } else if (charge.gameLevel == 'normal') {
        serviceid = '31';
    } else if (charge.gameLevel == 'hard') {
        serviceid = '32';
    }

    /* start - should be removed */
    return callback(null, {
        "Response": 1,
        "Msg": "your request has been sent successfully",
        "Data": {
            "TransactionID": 3181,
            "Status": null,
            "Result": null,
            "Desc": "Not confirmed yet"
        }
    });
    /* end - should be removed */

    var uri = dobApi.baseUrl + 'newrequest';
    var method = 'GET';
    var headers = dobApi.headers;
    var getData = {
        valid: '0',
        uniqueid: uniqueId,
        msisdn: parseInt(phone),
        serviceid: serviceid
    };

    // console.log('dob');
    // console.log(getData);

    var postDataFormat = null;
    var postData = null;

    doRequest(uri, method, headers, getData, postDataFormat, postData, function (err, body) {
        return callback(err, body);
    });

};


// err, hasCharged, charge
dobApi.sendPinConfirmation = function (charge, pin, callback) {

    console.log('dobApi.sendPinConfirmation = function (charge, pin, callback) {');

    var phone = charge.phone;
    var uniqueId = charge.uniqueId;
    var transactionId = charge.transactionId;
    var serviceid = '';

    if (charge.gameLevel == 'easy') {
        serviceid = '29';
    } else if (charge.gameLevel == 'normal') {
        serviceid = '31';
    } else if (charge.gameLevel == 'hard') {
        serviceid = '32';
    }

    /* start - should be removed */
    return callback(null, {
        "Response": 1,
        "Msg": "your request has been sent successfully",
        "Data": {
            "TransactionID": 3181,
            "Status": null,
            "Result": 1,
            "Desc": "Not confirmed yet"
        }
    });
    /* end - should be removed */

    var uri = dobApi.baseUrl + 'confirm';
    var method = 'GET';
    var headers = dobApi.headers;
    var getData = {
        msisdn: parseInt(phone),
        uniqueid: uniqueId,
        PIN: pin,
        TransactionID: transactionId,
        serviceid: serviceid
    };

    // console.log('dob confirm');
    // console.log(getData);

    var postDataFormat = null;
    var postData = null;

    doRequest(uri, method, headers, getData, postDataFormat, postData, function (err, body) {
        return callback(err, body);
    });

};


var doRequest = function (uri, method, headers, getData, postDataFormat, postData, callback) {

    console.log('var doRequest = function (uri, method, headers, getData, postDataFormat, postData, callback) {');

    uri += '?';

    // add other params
    if (getData != null) {
        Object.keys(getData).forEach(function (key) {
            var val = getData[key];
            uri += key + "=" + val + '&';
        });
    }


    // send request
    var options = {};
    options.uri = uri;
    options.method = method;
    if (postData != null) {
        options.postDataFormat = postData;
    }
    options.headers = headers;

    request(options, function (err, response, body) {

        // console.log('options, err, body');
        // console.log(options);
        // console.log(err);
        // console.log(JSON.parse(body));

        return callback(err, JSON.parse(body));
    });
};


module.exports = dobApi;
