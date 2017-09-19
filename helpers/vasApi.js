var request = require("request");
var vasApi = {};


vasApi.baseUrl = 'http://sms.goftalk.com:8080/api/';


vasApi.defaultParams = {
    auth_token: 'fjghure73489y743fg_38wgf374itfg3f78346',
    charge_code: 'FREEGOFC',
    SubUnsubMoMessage: 'NULL',
    SubUnsubType: 'NULL'
};


// err, body
vasApi.sendSmsNow = function (phone, message, callback) {


    /* start - should be removed */
    return callback(null, {
        status: "success",
        message: "پیامک فرستاده شد."
    });
    /* end - should be removed */


    var params = vasApi.defaultParams;
    params.phone = phone;
    params.message = message + "\n" + 'moliran.com';


    var uri = vasApi.baseUrl + 'send-sms-now';
    var method = 'POST';
    doRequest(uri, method, params, function (err, body) {
        return callback(err, body);
    });

};


var doRequest = function (uri, method, formData, callback) {
    // send request
    var options = {};
    options.uri = uri;
    options.method = method;
    options.formData = formData;

    request(options, function (err, response, body) {
        return callback(err, JSON.parse(body));
    });
};


module.exports = vasApi;
