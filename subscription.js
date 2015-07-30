var http = require('http');
var portfinder = require('portfinder');
var ip      = require("ip");

function Subscription(host, port, eventSub, callback) {
  var sid, resubscribeInterval, timeoutSeconds = 1800, httpSubscriptionResponseServer;
  this.unsubscribe = function() {
    clearInterval(resubscribeInterval);
    httpSubscriptionResponseServer.close();
    http.request({
      host: host,
      port: port,
      path: eventSub,
      method: 'UNSUBSCRIBE',
      headers: {
        'SID': sid
      }
    }, function(res) {
      console.log('Unsubscribe: '+ res.statusCode);
    }).end();
  };

  portfinder.getPort(function (err, availablePort) {
    httpSubscriptionResponseServer = http.createServer();
    httpSubscriptionResponseServer.on('request', callback);
    httpSubscriptionResponseServer.listen(availablePort, function() {
      http.request({
        host: host,
        port: port,
        path: eventSub,
        method: 'SUBSCRIBE',
        headers: {
          'CALLBACK': "<http://" + ip.address() + ':' + availablePort + ">",
          'NT': 'upnp:event',
          'TIMEOUT': 'Second-' + timeoutSeconds
        }
      }, function(res) {
        console.log('Subscribe: '+ res.statusCode + '; sid: ' + res.headers.sid);
        sid = res.headers.sid;
      }).end();
    });

    resubscribeInterval = setInterval(function() {
      http.request({
        host: host,
        port: port,
        path: eventSub,
        method: 'SUBSCRIBE',
        headers: {
          'SID': sid,
          'TIMEOUT': 'Second-' + timeoutSeconds
        }
      }, function(res) {
        console.log('Resubscribe: '+ res.statusCode);
      }).end();
    }, (timeoutSeconds-1) * 1000)
  });
}
module.exports = Subscription;