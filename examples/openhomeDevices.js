var ssdp = require('../');

const openhomeProducts = 'urn:av-openhome-org:service:Product:1';

ssdp.on('DeviceFound', console.log);
ssdp.on('DeviceAvailable:urn:av-openhome-org:service:Playlist:1', console.log);
ssdp.on('DeviceUnavailable:urn:av-openhome-org:service:Playlist:1', console.log);
ssdp.on('DeviceUpdate:urn:av-openhome-org:service:Playlist:1', console.log);

ssdp.mSearch(openhomeProducts);

setTimeout(ssdp.close, 20000);
