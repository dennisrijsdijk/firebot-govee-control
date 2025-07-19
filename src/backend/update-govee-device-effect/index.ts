import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import EffectType = Firebot.EffectType;
import template from "./index.html";
import { type GoveeService } from "../../frontend/govee-service";
import database from "../database";
import globals from "../../global";

type EffectModel = {
    deviceSelectionMode: "group" | "device";
    deviceGroupId?: string;
    deviceId?: string;
    updateTypes: {
        power?: {
            update: boolean;
            value: "on" | "off";
        },
        color?: {
            update: boolean;
            type: "preset" | "custom" | "temperature";
            colorValue: string;
            temperatureValue: string | number;
        },
        brightness?: {
            update: boolean;
            value: number;
        },
        // musicMode?
        scene?: {
            update: boolean;
            type: "preset" | "diy";
            presetScene?: {
                paramId: number;
                id: number;
            };
            diyScene?: number;
        }
    }
}

type EffectScope = ng.IScope & {
    debug: () => void;
    effect: Partial<EffectModel>;
    deviceModeOptions: Record<string, {
        text: string;
        description?: string;
    }>;
    powerModeOptions: Record<string, {
        text: string;
        description?: string;
    }>;
    sceneTypeOptions: Record<string, {
        text: string;
        description?: string;
    }>;
    colorUpdateTypes: Record<string, {
        text: string;
        description?: string;
    }>;
    deviceGroups: any;
    devices: any;
    goveeService: GoveeService;
    presetScenes: Array<{name: string; id: number; paramId: number;}>;
    diyScenes: Array<{name: string; value: number;}>;
};

const effect: EffectType<EffectModel> = {
    definition: {
        id: "dennisontheinternet:update-govee-device-effect",
        name: "Update Govee Device(s)",
        description: "Update the state of Govee devices or device groups.",
        icon: "fad fa-lightbulb",
        categories: ["integrations"]
    },
    optionsTemplate: template,
    // @ts-expect-error $scope
    optionsController: ($scope: EffectScope, goveeService: GoveeService) => {
        $scope.debug = () => { $scope; debugger; };
        goveeService.getDevices().then((devices) => {
            $scope.devices = Object.entries(devices).map(([id, device]) => ({
                id,
                name: device.deviceName
            }));
        });
        goveeService.getDeviceGroups().then((deviceGroups) => {
            $scope.deviceGroups = Object.entries(deviceGroups).map(([id, group]) => ({
                id,
                name: group.name
            }));
        });
        // TODO: Add a way to grab scenes from multiple device types if needed.
        goveeService.getDynamicScenes().then((dynamicScenes) => {
            $scope.presetScenes = Object.values(dynamicScenes)[0];
        });
        goveeService.getDiyScenes().then((diyScenes) => {
            $scope.diyScenes = Object.values(diyScenes)[0];
        });
        $scope.deviceModeOptions = {
            'group': { text: "Use Device Group", description: "Update all devices in a group." },
            'device': { text: "Use Single Device", description: "Update selected device." }
        };
        $scope.powerModeOptions = {
            'on': { text: "On", description: "Turn the device on." },
            'off': { text: "Off", description: "Turn the device off." }
        };
        $scope.sceneTypeOptions = {
            'preset': { text: "Govee Scene", description: "Select a scene by Govee." },
            'diy': { text: "DIY Scene", description: "Select a DIY scene." }
        };
        $scope.colorUpdateTypes = {
            'preset': { text: "Preset Color", description: "Select a color from the preset options." },
            'custom': { text: "Custom Color", description: "Select a custom color." },
            'temperature': { text: "Color Temperature", description: "Set the color temperature of the device." }
        };
        $scope.goveeService = goveeService;
        if (!$scope.effect.updateTypes) {
            $scope.effect = {
                ...$scope.effect,
                deviceSelectionMode: goveeService.deviceGroups && Object.keys(goveeService.deviceGroups).length > 0 ? "group" : "device",
                deviceGroupId: goveeService.deviceGroups ? Object.keys(goveeService.deviceGroups)[0] : undefined,
                updateTypes: {}
            };
        }
        if (!$scope.effect.updateTypes.power) {
            $scope.effect.updateTypes.power = { update: false, value: "on" };
        }
        if (!$scope.effect.updateTypes.color) {
            $scope.effect.updateTypes.color = { update: false, type: "preset", colorValue: "#ff69b4", temperatureValue: 4000 };
        }
        if (!$scope.effect.updateTypes.brightness) {
            $scope.effect.updateTypes.brightness = { update: false, value: 100 };
        }
        if (!$scope.effect.updateTypes.scene) {
            $scope.effect.updateTypes.scene = { update: false, type: "preset" };
        }
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.deviceSelectionMode === "group" && !effect.deviceGroupId) {
            errors.push("Please select a device group.");
        } else if (effect.deviceSelectionMode === "device" && !effect.deviceId) {
            errors.push("Please select at least one device.");
        }

        if (effect.updateTypes.color.update && effect.updateTypes.color.type === "temperature" && !effect.updateTypes.color.temperatureValue) {
            errors.push("Please select a temperature value.");
        } else if (effect.updateTypes.color.update && effect.updateTypes.color.type !== "temperature" && !effect.updateTypes.color.colorValue) {
            errors.push("Please select a color value.");
        }

        if (effect.updateTypes.brightness.update && (effect.updateTypes.brightness.value < 0 || effect.updateTypes.brightness.value > 100)) {
            errors.push("Brightness value must be between 0 and 100.");
        }

        if (effect.updateTypes.color.update && effect.updateTypes.scene.update) {
            errors.push("You cannot update both color and scene at the same time. Please choose one.");
        }

        if (effect.updateTypes.scene.update && effect.updateTypes.scene.type === "preset" && !effect.updateTypes.scene.presetScene.paramId) {
            errors.push("Please select a preset scene.");
        } else if (effect.updateTypes.scene.update && effect.updateTypes.scene.type === "diy" && !effect.updateTypes.scene.diyScene) {
            errors.push("Please select a DIY scene.");
        }

        if (!Object.values(effect.updateTypes).some(update => update.update)) {
            errors.push("Please select at least one update type to apply.");
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        if (!Object.values(event.effect.updateTypes).some(update => update.update)) {
            globals.runRequest.modules.logger.debug("Govee: No updates selected, skipping effect.");
            return;
        }
        const actionableDevices: DatabaseSchema["devices"] = {};
        if (event.effect.deviceSelectionMode === "group") {
            const devices = await database.getDevices();
            ((await database.getDeviceGroups())[event.effect.deviceGroupId]?.devices || [])
                .forEach(deviceId => actionableDevices[deviceId] = devices[deviceId]);
            if (Object.keys(actionableDevices).length < 1) {
                globals.runRequest.modules.logger.debug("Govee: No devices found in the selected group.");
                return;
            }
        } else {
            const devices = await database.getDevices();
            if (!event.effect.deviceId || !devices[event.effect.deviceId]) {
                globals.runRequest.modules.logger.debug("Govee: No device selected or device not found.");
                return;
            }
            actionableDevices[event.effect.deviceId] = devices[event.effect.deviceId];
        }

        const promises: Promise<any>[] = [];

        Object.entries(actionableDevices).forEach(([deviceId, device]) => {
            if (event.effect.updateTypes.power.update) {
                promises.push(globals.govee.capabilities.setPower({ sku: device.sku, device: deviceId }, event.effect.updateTypes.power.value === "on"));
            }
            if (event.effect.updateTypes.color.update) {
                if (event.effect.updateTypes.color.type === "temperature") {
                    promises.push(globals.govee.capabilities.setColorTemperature({ sku: device.sku, device: deviceId }, event.effect.updateTypes.color.temperatureValue as number));
                } else {
                    promises.push(globals.govee.capabilities.setColorRgb({ sku: device.sku, device: deviceId }, event.effect.updateTypes.color.colorValue));
                }
            }
            if (event.effect.updateTypes.brightness.update) {
                promises.push(globals.govee.capabilities.setBrightness({ sku: device.sku, device: deviceId }, event.effect.updateTypes.brightness.value));
            }
            if (event.effect.updateTypes.scene.update) {
                if (event.effect.updateTypes.scene.type === "preset") {
                    promises.push(globals.govee.capabilities.setDynamicScene({ sku: device.sku, device: deviceId }, event.effect.updateTypes.scene.presetScene.paramId, event.effect.updateTypes.scene.presetScene.id));
                } else {
                    promises.push(globals.govee.capabilities.setDiyScene({ sku: device.sku, device: deviceId }, event.effect.updateTypes.scene.diyScene));
                }
            }
        });

        // if wait for execution is enabled, we can wait for all promises to resolve
        // await Promise.all(promises)
    }
};

export default effect;