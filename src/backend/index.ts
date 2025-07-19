import database from "./database"
import globals from "../global";
import updateGoveeDeviceEffect from "./update-govee-device-effect";

export async function fetchDevices() {
    const devices = await globals.govee.devices.getDevices();
    if (devices.length > 0) {
        await database.setDevices(Object.fromEntries(devices.map(device => [device.device, device])));
        const deviceTypes: GoveeDevice[] = [];
        for (const device of devices) {
            if (!deviceTypes.find(storedDevice => storedDevice.type === device.type)) {
                deviceTypes.push(device);
            }
        }

        globals.runRequest.modules.logger.debug("Fetching dynamic and DIY scenes for devices:", deviceTypes);

        const deviceDynamicScenes = Object.fromEntries(await Promise.all(deviceTypes.map(async device => {
            const scenes = await globals.govee.capabilities.getDynamicScenes({ device: device.device, sku: device.sku });
            return [device.sku, scenes];
        })));

        await database.setDynamicScenes(deviceDynamicScenes);
        
        const deviceDiyScenes = Object.fromEntries(await Promise.all(deviceTypes.map(async device => {
            const scenes = await globals.govee.capabilities.getDiyScenes({ device: device.device, sku: device.sku });
            return [device.sku, scenes];
        })));

        await database.setDiyScenes(deviceDiyScenes);
    }
}

export async function initBackend() {
    if (await database.init()) {
        await fetchDevices();
    }

    globals.runRequest.modules.frontendCommunicator.onAsync('govee:fetch-devices', async () => {
        return fetchDevices();
    });

    globals.runRequest.modules.effectManager.registerEffect(updateGoveeDeviceEffect);
}