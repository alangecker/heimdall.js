# heimdall.js
heimdall.js is an implementation of Samsungs Odin3 protocol in TypeScript. 

heavily inspired by [fastboot.js](https://github.com/kdrag0n/fastboot.js) with the same goal.


## Current State
- **More a proof of concept than proper working**
- only tested on a single phone
- no documentation

## Features
- flash a recovery image via node.js
- flashing anything via WebUSB in the browser should also work, but is not tested yet

## Installation
```bash
git clone https://github.com/alangecker/heimdall.js.git
cd heimdall.js
yarn install
```

## Usage (CLI / node.js)
```
yarn heimdall.js flash-recovery FILENAME
```

## Protocol References
- https://github.com/KOLANICH-tools/USBPcapOdinDumper
- https://github.com/Benjamin-Dobell/Heimdall/tree/master/heimdall/source
- https://github.com/Samsung-Loki/Thor
- https://github.com/nickelc/wuotan
