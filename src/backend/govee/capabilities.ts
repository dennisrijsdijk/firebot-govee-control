import { apiCall, hexToRgbInt } from './util'


class GoveeCapabilitiesApi {
    private _apiKey: string;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    set apiKey(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        this._apiKey = apiKey;
    }

    private setDeviceCapability(apiDevice: ApiCommandDevice, capability: SimpleCommandCapability | StructCommandCapability): Promise<any> {
        return apiCall(this._apiKey, `device/control`, 'POST', {
            device: apiDevice.device,
            sku: apiDevice.sku,
            capability: capability,
        });
    }

    setPower(apiDevice: ApiCommandDevice, power_on: boolean): Promise<any> {
        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.on_off",
            instance: "powerSwitch",
            value: power_on ? 1 : 0
        });
    }

    setBrightness(apiDevice: ApiCommandDevice, brightness: number): Promise<any> {
        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.brightness",
            instance: "brightness",
            value: Math.max(0, Math.min(100, brightness)) // Clamp to 0-100%
        });
    }

    setColorRgb(apiDevice: ApiCommandDevice, color: string): Promise<any> {
        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.color_setting",
            instance: "colorRgb",
            value: hexToRgbInt(color)
        });
    }

    setColorTemperature(apiDevice: ApiCommandDevice, temperature: number): Promise<any> {
        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.color_setting",
            instance: "colorTemperatureK",
            value: Math.max(2700, Math.min(6500, temperature)) // Clamp to valid range
        });
    }

    setMusicMode(apiDevice: ApiCommandDevice, parameters: MusicModeParameters): Promise<any> {
        const { musicMode, sensitivity, autoColor, rgb } = parameters;

        if (musicMode == null || sensitivity == null) {
            throw new Error('Music mode and sensitivity are required parameters');
        }

        const capability: StructCommandCapability = {
            type: "devices.capabilities.music_mode",
            instance: "musicMode",
            value: {
                musicMode,
                sensitivity
            }
        };

        if (autoColor != null) {
            capability.value.autoColor = autoColor ? 1 : 0;
        }
        if (rgb != null) {
            capability.value.rgb = hexToRgbInt(rgb);
        }

        return this.setDeviceCapability(apiDevice, capability);
    }

    getDynamicScenes(apiDevice: ApiCommandDevice): Promise<DynamicScene[]> {
        return apiCall(this._apiKey, `device/scenes`, 'POST', {
            device: apiDevice.device,
            sku: apiDevice.sku
        }).then(response => {
            return (response as any).payload.capabilities[0].parameters.options.map((scene: any) => ({
                name: scene.name,
                ...scene.value
            }));
        });
    }

    getDiyScenes(apiDevice: ApiCommandDevice): Promise<DiyScene[]> {
        return apiCall(this._apiKey, `device/diy-scenes`, 'POST', {
            device: apiDevice.device,
            sku: apiDevice.sku
        }).then(response => (response as any).payload.capabilities[0].parameters.options);
    }

    setDynamicScene(apiDevice: ApiCommandDevice, paramId: number, id: number): Promise<any> {
        if (!paramId) {
            throw new Error('Scene ID is required');
        }

        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.dynamic_scene",
            instance: "lightScene",
            value: {
                paramId,
                id
            }
        });
    }

    setDiyScene(apiDevice: ApiCommandDevice, sceneId: number): Promise<any> {
        if (!sceneId) {
            throw new Error('Scene ID is required');
        }

        return this.setDeviceCapability(apiDevice, {
            type: "devices.capabilities.diy_color_setting",
            instance: "diyScene",
            value: sceneId
        });
    }
}

export default GoveeCapabilitiesApi;