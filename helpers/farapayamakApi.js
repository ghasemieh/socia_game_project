var qs = require("querystring");
var http = require("http");

var options = {
    method: "POST",
    hostname: "rest.payamak-panel.com",
    port: null,
    path: "/api/SendSMS/SendSMS",
    headers: {
        "cache-control": "no-cache",
        "postman-token": "986f8677-6806-fd9c-62bf-5b7594a44066",
        "content-type": "application/x-www-form-urlencoded"
    },
    username: '9124092905',
    password: 'Art123hibition@',
    from: '500012700443',
    isflash: false
};


function farapayamakApi() {

}


/**
 * send sms
 * @param phone
 * @param message
 * @param callback
 * @returns {*}
 */
farapayamakApi.prototype.sendSmsNow = function (phone, message, callback) {

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();
            body = JSON.parse(body);

            if (!body.hasOwnProperty('StrRetStatus')) {
                return callback('پیامک فرستاده نشد!', null);
            }

            var result = {};
            if (body['StrRetStatus'] === 'Ok') {
                result.status = 'ok';
                result.message = 'پیامک فرستاده شد.';
                result.data = body;
            } else {
                result.status = 'fail';
                result.message = 'پیامک فرستاده نشد!';
                result.data = body;
            }

            return callback(null, result);
        });
    });

    req.write(qs.stringify({
        username: options.username,
        password: options.password,
        to: phone,
        from: options.from,
        text: message + "\n" + "moliran.com",
        isflash: options.isflash
    }));

    try {
        req.end();
    } catch (e) {
        var result = {};
        result.status = 'fail';
        result.message = 'پیامک فرستاده نشد!';
        return callback(null, result);
    }
};

module.exports = new farapayamakApi;
