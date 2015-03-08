var ssdp = require('../');

const linnSources = 'urn:linn-co-uk:device:Source:1';

ssdp.on('DeviceFound', console.log);
ssdp.on('DeviceAvailable:urn:av-openhome-org:service:Playlist:1', console.log);
ssdp.on('DeviceUnavailable:urn:av-openhome-org:service:Playlist:1', console.log);
ssdp.on('DeviceUpdate:urn:av-openhome-org:service:Playlist:1', console.log);

ssdp.mSearch(linnSources);

setTimeout(ssdp.close, 20000);
