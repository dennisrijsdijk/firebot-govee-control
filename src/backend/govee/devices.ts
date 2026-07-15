import { apiCall } from './util';

class GoveeDeviceApi {
    private _apiKey?: string;

    set apiKey(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this._apiKey = apiKey;
    }

    async getDevices(): Promise<Array<GoveeDevice>> {
        if (!this._apiKey) {
            throw new Error("getDevices: apiKey was null");
        }

        const devices =  await apiCall<GetDevicesResponse>(this._apiKey, 'user/devices', 'GET');
        return devices.data.filter((device: GoveeDevice) => device.sku !== "BaseGroup" && device.sku !== "SameModeGroup");
    }

    getDeviceState(apiDevice: ApiCommandDevice): Promise<GetStateResponse> {
        if (!this._apiKey) {
            throw new Error("getDeviceState: apiKey was null");
        }

        return apiCall(this._apiKey, `device/state`, 'POST', apiDevice);
    }
}

export default GoveeDeviceApi;