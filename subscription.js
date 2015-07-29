var http = require('http');
var portfinder = require('portfinder');
var ip      = require("ip");
var responseParsers = require("./responseparsers.js");
var _ = require('underscore');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false});

function elementText(element) {
    return _.isObject(element) ? element._ : element;
}
function first(element) {
    return _.isArray(element) ? element[0] : element;
}

function toTrack(result, callback) {
    if (result['e:propertyset']['e:property']) {
      var dictionary = _.chain(result['e:propertyset']['e:property'])
        .reduce(_.extend, {})
        .pick('Uri', 'Metadata')
        .value();
      if (dictionary.Metadata) {
        xmlParser.parseString(dictionary.Metadata, function (err, result) {
          callback(null, {
            uri: dictionary.Uri,
            artist: elementText(first(result['DIDL-Lite'].item['upnp:artist'])),
            title: elementText(first(result['DIDL-Lite'].item['dc:title'])),
            albumArt: elementText(first(result['DIDL-Lite'].item['upnp:albumArtURI'])),
            album: elementText(first(result['DIDL-Lite'].item['upnp:album']))
          });
        });
      } else {
        callback(new Error('No metadata found'));
      }
    } else {
        callback(new Error('No track found'));
    }
}

function Subscribe(host, port, eventSub, callback) {
  portfinder.getPort(function (err, availablePort) {
    var httpSubscriptionResponseServer = http.createServer();
    httpSubscriptionResponseServer.on('request', responseParsers.xml(toTrack, callback));

    httpSubscriptionResponseServer.listen(availablePort, function() {
      http.request({
        host: host,
        port: port,
        path: eventSub,
        method: 'SUBSCRIBE',
        headers: {
          'CALLBACK': "<http://" + ip.address() + ':' + availablePort + ">",
          'NT': 'upnp:event',
          'TIMEOUT': 'Second-30'
        }
      }, function(res) {
        // console.log(res.statusCode);
      }).end();
    });
  });
}
module.exports = Subscribe;