import GoveeCapabilitiesApi from "./capabilities";
import GoveeDeviceApi from "./devices";

class GoveeApi {
    private _capabilities: GoveeCapabilitiesApi;
    private _devices: GoveeDeviceApi;

    constructor() {
        this._capabilities = new GoveeCapabilitiesApi();
        this._devices = new GoveeDeviceApi();
    }

    set apiKey(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this._capabilities.apiKey = apiKey;
        this._devices.apiKey = apiKey;
    }

    get capabilities() {
        return this._capabilities;
    }

    get devices() {
        return this._devices;
    }
}

export default new GoveeApi();