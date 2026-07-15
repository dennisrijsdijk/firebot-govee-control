import { existsSync, mkdirSync } from "fs";
import firebot from "@crowbartools/firebot-types";
import govee from "./govee";
import path from "path";

import { JsonDB, Config } from "node-json-db";

class GoveeDb {
    private _database: JsonDB;
    private _dbDir: string;

    constructor() {
        this._dbDir = path.join(firebot.storage.path, "..", "govee-control");
        if (!existsSync(this._dbDir)) {
            mkdirSync(this._dbDir, { recursive: true });
        }
        const dbPath = path.join(this._dbDir, "db.json");
        this._database = new JsonDB(new Config(dbPath, true, true, '/'));
    }

    /**
     * Initializes the database.
     * @returns Returns true if the database was freshly created, false if it already exists.
     */
    async init(): Promise<boolean> {
        if (await this._database.exists("/devices")) {
            return false; // Database already exists, no need to seed schema
        }

        await this._database.push("/", {
            devices: {},
            deviceGroups: {},
            dynamicScenes: {},
            diyScenes: {}
        }, true);
        return true;
    }

    async getDevices(): Promise<DatabaseSchema["devices"]> {
        const devices = await this._database.getData("/devices");
        return devices;
    }

    async setDevices(devices: DatabaseSchema["devices"]): Promise<void> {
        this._database.push("/devices", devices, true);
    }

    async getDeviceGroups(): Promise<DatabaseSchema["deviceGroups"]> {
        return this._database.getData("/deviceGroups");
    }

    async setDeviceGroups(deviceGroups: DatabaseSchema["deviceGroups"]): Promise<void> {
        this._database.push("/deviceGroups", deviceGroups, true);
    }

    async getDynamicScenes(): Promise<DatabaseSchema["dynamicScenes"]> {
        return this._database.getData("/dynamicScenes");
    }

    async setDynamicScenes(dynamicScenes: DatabaseSchema["dynamicScenes"]): Promise<void> {
        this._database.push("/dynamicScenes", dynamicScenes, true);
    }

    async getDiyScenes(): Promise<DatabaseSchema["diyScenes"]> {
        return this._database.getData("/diyScenes");
    }

    async setDiyScenes(diyScenes: DatabaseSchema["diyScenes"]): Promise<void> {
        this._database.push("/diyScenes", diyScenes, true);
    }

    async fetchDevices() {
        const devices = await govee.devices.getDevices();
        if (devices.length === 0) {
            return;
        }
        await this.setDevices(Object.fromEntries(devices.map(device => [device.device, device])));
        const deviceTypes: GoveeDevice[] = [];
        for (const device of devices) {
            if (!deviceTypes.find(storedDevice => storedDevice.type === device.type)) {
                deviceTypes.push(device);
            }
        }

        firebot.logger.debug("Fetching dynamic and DIY scenes for devices:", deviceTypes);

        const deviceDynamicScenes = Object.fromEntries(await Promise.all(deviceTypes.map(async device => {
            const scenes = await govee.capabilities.getDynamicScenes({ device: device.device, sku: device.sku });
            return [device.sku, scenes];
        })));

        await this.setDynamicScenes(deviceDynamicScenes);

        const deviceDiyScenes = Object.fromEntries(await Promise.all(deviceTypes.map(async device => {
            const scenes = await govee.capabilities.getDiyScenes({ device: device.device, sku: device.sku });
            return [device.sku, scenes];
        })));

        await this.setDiyScenes(deviceDiyScenes);
    }
}

export default new GoveeDb();