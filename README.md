# node-ssdp

Simple Service Discovery for Node 0.12, handling Upnp NOTIFY and M-SEARCH requests. 

This is pretty much a rewrite of a library I forked https://github.com/bazwilliams/node-upnp-client the fork of which stopped working when I upgraded to Node 12. I decided to pare the library right down to the parts I was using, i.e. SSDP and rewrite those portions. 

## Installation

`npm install node-upnp-ssdp`

## Examples

In the examples folder there are some example applications one of which shows a simple service discovery with a preset mSearch for Openhome Devices; the other shows simple service discover if the parameter is left unset, the search request is for all devices `ssdp:all`. 

If a device is found a `DeviceFound` event is emitted. 

Whenever the module is first used, it starts listening for SSDP broadcasts from other devices on your network, it will announce the following events:

* DeviceAvailable - emitted when a NOTIFY message received with `ssdp:alive`
* DeviceUnavailable - emitted when a NOTIFY message received with `ssdp:byebye`
* DeviceUpdate - emitted when a NOTIFY message received with `ssdp:update`

In addition, the above events also emit events categorised by their notfication type. I.e. if you are only interested in Openhome playlist services with type `urn:av-openhome-org:service:Playlist:1`. Then add the notification type after the event name you are interested in. For example:

```javascript
ssdp.on('DeviceAvailable:urn:av-openhome-org:service:Playlist:1', console.log);
```

## References:
Openhome:
http://www.openhome.org/wiki/Oh:Overview

Upnp Specs:
http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf
