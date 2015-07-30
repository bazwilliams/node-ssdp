var Subscription = require('../subscription.js');
var responseParsers = require("../responseparsers.js");
var _ = require('underscore');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false});

function elementText(element) {
    return _.isObject(element) ? element._ : element;
}
function first(element) {
    return _.isArray(element) ? element[0] : element;
}

function infoEvent(result, callback) {
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

var host = '192.168.1.127';
var port = 55178;
var infoSub = '/Ds/Info/event';
var productSub = '/Ds/Product/event';

var infoSub = new Subscription(host, port, infoSub, responseParsers.xml(infoEvent, function(err, data) { console.log(data); }));

setTimeout(infoSub.unsubscribe, 10000);