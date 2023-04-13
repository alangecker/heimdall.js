import { WebUSBDevice, getDeviceList } from 'usb';
import { OdinDevice } from './OdinDevice.js'
import fs from 'fs'


const action = process.argv[2]
const file = process.argv[3]

if(action !== 'flash-recovery' || !file) {
    console.log(`USAGE: yarn heimdall.js flash-recovery FILENAME`)
    process.exit(1)
}
fs.statSync(file)

const devices = getDeviceList()
    .filter(d => d.deviceDescriptor.idVendor === 0x04E8)
    .filter(d => [0x6601, 0x685D,0x68C3].includes(d.deviceDescriptor.idProduct))

if(!devices.length) {
    console.error('Failed to detect compatible download-mode device.')
    process.exit(1)
}
if(devices.length > 1) {
    console.error('More than one compatible device found. this is currently not supported')
    process.exit(1)
}


void async function() {
    const webDevice = await WebUSBDevice.createInstance(devices[0]);
    const d = new OdinDevice(webDevice)
    await d.initialise()
    await d.beginSession()
    await d.flash({
        RECOVERY: new Uint8Array(fs.readFileSync(file))
    })
    await d.endSession()
    // await d.reboot()
    await webDevice.close()
}()