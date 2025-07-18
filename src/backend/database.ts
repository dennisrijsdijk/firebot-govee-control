import frontendCommunicator from "./frontend-communicator";
import globals from "../global";

import { JsonDB, Config } from "node-json-db";

class GoveeDb {
    private _database: JsonDB;

    /**
     * Initializes the database.
     * @returns Returns true if the database was freshly created, false if it already exists.
     */
    async init(): Promise<boolean> {
        this._database = new JsonDB(new Config(globals.runRequest.modules.path.join(globals.scriptDataDir, "db.json"), true, true, '/'));
        if (await this._database.exists("/devices")) {
            this.setupFrontendListeners();
            return false; // Database already exists, no need to seed device data
        }

        await this._database.push("/", {
            devices: {},
            deviceGroups: {},
            dynamicScenes: {},
            diyScenes: {}
        }, true);
        this.setupFrontendListeners();
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

    private setupFrontendListeners() {
        frontendCommunicator.on('govee:get-devices', async () => {
            return this.getDevices();
        });
        frontendCommunicator.on('govee:get-device-groups', async () => {
            return this.getDeviceGroups();
        });
        frontendCommunicator.on('govee:set-device-groups', async (deviceGroups: DatabaseSchema["deviceGroups"]) => {
            return this.setDeviceGroups(deviceGroups);
        });
        frontendCommunicator.on('govee:get-dynamic-scenes', async () => {
            return this.getDynamicScenes();
        });
        frontendCommunicator.on('govee:get-diy-scenes', async () => {
            return this.getDiyScenes();
        });
    }
}

export default new GoveeDb();