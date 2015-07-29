"use strict";

var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false});

exports.xml = function (parser, callback) {
    return function xmlHttpResponse(res) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            xmlParser.parseString(body, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    parser(result, callback);
                }
            });
        });
    };
};