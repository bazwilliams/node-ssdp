var Subscription = require('../subscription.js');

var host = '192.168.1.127';
var port = 55178;
var eventSub = '/Ds/Info/event';

var dsSub = new Subscription(host, port, eventSub, function(err, data) { console.log(data); });