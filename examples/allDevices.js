var ssdp = require('../');

ssdp.on('DeviceFound', console.log);
ssdp.on('DeviceAvailable', console.log);
ssdp.on('DeviceUnavailable', console.log);
ssdp.on('DeviceUpdate', console.log);

ssdp.mSearch();

setTimeout(ssdp.close, 20000);
