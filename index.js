var dgram   = require("dgram");
var util    = require("util");
var events  = require("events");
var _       = require("underscore");

const SSDP_PORT = 1900;
const BROADCAST_ADDR = "239.255.255.250";
const SSDP_ALIVE = 'ssdp:alive';
const SSDP_BYEBYE = 'ssdp:byebye';
const SSDP_UPDATE = 'ssdp:update';
const SSDP_ALL = 'ssdp:all';

const SSDP_NTS_EVENTS = {
  'ssdp:alive': 'DeviceAvailable',
  'ssdp:byebye': 'DeviceUnavailable',
  'ssdp:update': 'DeviceUpdate'
};

const UPNP_FIELDS = ['host', 'server', 'location', 'st', 'usn', 'nts', 'nt', 'bootid.upnp.org', 'configid.upnp.org', 'nextbootid.upnp.org', 'searchport.upnp.org'];

function messageLines(msg) {
  return msg.toString('ascii').split('\r\n');
}

function toKeyPair(header) {
  var result, tuple = header.split(': ');
  if (tuple[1]) {
    var result = {};
    result[tuple[0].toLowerCase()] = tuple[1];
  }
  return result;
}

function mSearchResponseParser(msg, rinfo) {
    var headers = messageLines(msg);
    if (headers[0] === 'HTTP/1.1 200 OK') {
      return _.chain(headers)
        .map(toKeyPair)
        .compact()
        .reduce(_.extend)
        .pick(UPNP_FIELDS)
        .value();
    }
    return void 0;
}

function notifyResponseParser(msg, rinfo) {
    var headers = messageLines(msg);
    if (headers[0] === 'NOTIFY * HTTP/1.1') {
      return _.chain(headers)
        .map(toKeyPair)
        .compact()
        .reduce(_.extend)
        .pick(UPNP_FIELDS)
        .value();
    }
    return void 0;
}

function announceDiscoveredDevice(emitter) {
  return function (msg, rinfo) {
    var device = mSearchResponseParser(msg, rinfo);
    if (device) {
      emitter.emit('DeviceFound', device);
    }
  };
}

function announceDevice(emitter) {
  return function (msg, rinfo) {
    var device = notifyResponseParser(msg, rinfo);
    if (device) {
      emitter.emit(SSDP_NTS_EVENTS[device.nts], device);
      emitter.emit(SSDP_NTS_EVENTS[device.nts]+':'+device.nt, device);
    }
  };
}

function Ssdp() {
  events.EventEmitter.call(this);

  var udpServer = dgram.createSocket({ type: 'udp4', reuseAddr: true }, announceDevice(this));
  udpServer.bind(SSDP_PORT, function onConnected() {
    udpServer.addMembership(BROADCAST_ADDR);
  });

  this.close = function() {
    udpServer.close();
  }

  this.mSearch = function(st) {
    if (typeof st !== 'string') {
      st = SSDP_ALL;
    }

    var message = 
      "M-SEARCH * HTTP/1.1\r\n"+
      "Host:"+BROADCAST_ADDR+":"+SSDP_PORT+"\r\n"+
      "ST:"+st+"\r\n"+
      "Man:\"ssdp:discover\"\r\n"+
      "MX:2\r\n\r\n";
    
    var mSearchListener = dgram.createSocket({ type: 'udp4', reuseAddr: true }, announceDiscoveredDevice(this));
    var mSearchRequester = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    mSearchListener.on('listening', function () {
      mSearchRequester.send(new Buffer(message, "ascii"), 0, message.length, SSDP_PORT, BROADCAST_ADDR, function closeMSearchRequester() {
        mSearchRequester.close();
      });
    });

    mSearchRequester.on('listening', function () {
      mSearchListener.bind(mSearchRequester.address().port);
    });

    mSearchRequester.bind();

    // MX is set to 2, wait for 1 additional sec. before closing the server
    setTimeout(function(){
      mSearchListener.close();
    }, 3000);
  };
}

util.inherits(Ssdp, events.EventEmitter);

module.exports = new Ssdp();
