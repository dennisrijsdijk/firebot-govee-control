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
            value: "on" | "off" | "advanced";
            advancedValue?: "on" | "off";
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
        // 
        /** @deprecated Legacy (pre-release) support, use sceneV2 instead */
        scene?: {
            update: boolean;
            type: "preset" | "diy";
            presetScene?: {
                paramId: number;
                id: number;
            };
            diyScene?: number;
        }
        sceneV2?: {
            update: boolean;
            type: "preset" | "presetAdvanced" | "diy" | "diyAdvanced";
            presetScene?: string;
            diyScene?: string;
        };
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
    presetScenes: Array<{ name: string; id: number; paramId: number; }>;
    simplePresetScenes: string[];
    diyScenes: Array<{ name: string; value: number; }>;
    simpleDiyScenes: string[];
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

        $scope.deviceModeOptions = {
            'group': { text: "Use Device Group", description: "Update all devices in a group." },
            'device': { text: "Use Single Device", description: "Update selected device." }
        };
        $scope.powerModeOptions = {
            'on': { text: "On", description: "Turn the device on." },
            'off': { text: "Off", description: "Turn the device off." },
            'advanced': { text: "Advanced", description: "Variable input for power value. 'on' or 'off'" }
        };
        $scope.sceneTypeOptions = {
            'preset': { text: "Govee Scene", description: "Select a scene by Govee." },
            'presetAdvanced': { text: "Govee Scene (Advanced)", description: "Manually enter a Govee Scene Name" },
            'diy': { text: "DIY Scene", description: "Select a DIY scene." },
            'diyAdvanced': { text: "DIY Scene (Advanced)", description: "Manually enter a DIY Scene Name" }
        };
        $scope.colorUpdateTypes = {
            'preset': { text: "Color Picker", description: "Select a color from the color picker." },
            'custom': { text: "Custom Code", description: "Enter a hex color code." },
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
        if (!$scope.effect.updateTypes.sceneV2) {
            $scope.effect.updateTypes.sceneV2 = { update: false, type: "preset" };
        }

        Promise.all([
            goveeService.getDynamicScenes(),
            goveeService.getDiyScenes()
        ]).then(([dynamicScenes, diyScenes]) => {
            $scope.presetScenes = Object.values(dynamicScenes)[0];
            $scope.simplePresetScenes = $scope.presetScenes.map(scene => scene.name);
            $scope.diyScenes = Object.values(diyScenes)[0];
            $scope.simpleDiyScenes = $scope.diyScenes.map(scene => scene.name);

            if ($scope.effect.updateTypes.scene) {
                $scope.effect.updateTypes.sceneV2.update = $scope.effect.updateTypes.scene.update;
                $scope.effect.updateTypes.sceneV2.type = $scope.effect.updateTypes.scene.type;
                if ($scope.effect.updateTypes.scene.presetScene) {
                    $scope.effect.updateTypes.sceneV2.presetScene = $scope.presetScenes.find(scene => scene.id === $scope.effect.updateTypes.scene?.presetScene?.id && scene.paramId === $scope.effect.updateTypes.scene?.presetScene?.paramId)?.name;
                }
                if ($scope.effect.updateTypes.scene.diyScene) {
                    $scope.effect.updateTypes.sceneV2.diyScene = $scope.diyScenes.find(scene => scene.value === $scope.effect.updateTypes.scene?.diyScene)?.name;
                }
                $scope.effect.updateTypes.scene = undefined;
                delete $scope.effect.updateTypes.scene;
            }
        });
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.deviceSelectionMode === "group" && !effect.deviceGroupId) {
            errors.push("Please select a device group.");
        } else if (effect.deviceSelectionMode === "device" && !effect.deviceId) {
            errors.push("Please select at least one device.");
        }

        if (effect.updateTypes.power?.update && effect.updateTypes.power.value === "advanced" && (!effect.updateTypes.power.advancedValue || (effect.updateTypes.power.advancedValue.trim() === ""))) {
            errors.push("Please enter a power value.");
        }

        if (effect.updateTypes.color.update && effect.updateTypes.color.type === "temperature" && !effect.updateTypes.color.temperatureValue) {
            errors.push("Please select a temperature value.");
        } else if (effect.updateTypes.color.update && effect.updateTypes.color.type !== "temperature" && !effect.updateTypes.color.colorValue) {
            errors.push("Please select a color value.");
        }

        if (effect.updateTypes.brightness.update && (effect.updateTypes.brightness.value < 0 || effect.updateTypes.brightness.value > 100)) {
            errors.push("Brightness value must be between 0 and 100.");
        }

        if (effect.updateTypes.color.update && effect.updateTypes.sceneV2.update) {
            errors.push("You cannot update both color and scene at the same time. Please choose one.");
        }

        if (effect.updateTypes.sceneV2.update && (effect.updateTypes.sceneV2.type === "preset" || effect.updateTypes.sceneV2.type === "presetAdvanced") && (!effect.updateTypes.sceneV2.presetScene || effect.updateTypes.sceneV2.presetScene.trim() === "")) {
            errors.push("Please select a preset scene.");
        } else if (effect.updateTypes.sceneV2.update && (effect.updateTypes.sceneV2.type === "diy" || effect.updateTypes.sceneV2.type === "diyAdvanced") && (!effect.updateTypes.sceneV2.diyScene || effect.updateTypes.sceneV2.diyScene.trim() === "")) {
            errors.push("Please select a DIY scene.");
        }

        if (!Object.values(effect.updateTypes).some(update => update.update)) {
            errors.push("Please select at least one update type to apply.");
        }

        return errors;
    },
    onTriggerEvent: async (event) => {
        if (!Object.values(event.effect.updateTypes).some(update => update?.update)) {
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

        const [dynamicScenes, diyScenes] = await Promise.all([
            database.getDynamicScenes().then(scenes => Object.values(scenes)[0]),
            database.getDiyScenes().then(scenes => Object.values(scenes)[0])
        ]);

        const promises: Promise<any>[] = [];

        for (const [deviceId, device] of Object.entries(actionableDevices)) {
            if (event.effect.updateTypes.power.update) {
                if (event.effect.updateTypes.power.value === "advanced") {
                    const advancedValue = event.effect.updateTypes.power.advancedValue.trim().toLowerCase();
                    if (advancedValue === "on" || advancedValue === "off") {
                        promises.push(globals.govee.capabilities.setPower({ sku: device.sku, device: deviceId }, advancedValue === "on"));
                    }
                } else {
                    promises.push(globals.govee.capabilities.setPower(
                        { sku: device.sku, device: deviceId },
                        event.effect.updateTypes.power.value === "on"
                    ));
                }
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
            if (event.effect.updateTypes.scene?.update) {
                if (event.effect.updateTypes.scene.type === "preset") {
                    promises.push(globals.govee.capabilities.setDynamicScene({ sku: device.sku, device: deviceId }, event.effect.updateTypes.scene.presetScene.paramId, event.effect.updateTypes.scene.presetScene.id));
                } else {
                    promises.push(globals.govee.capabilities.setDiyScene({ sku: device.sku, device: deviceId }, event.effect.updateTypes.scene.diyScene));
                }
            }
            if (event.effect.updateTypes.sceneV2?.update) {
                if (event.effect.updateTypes.sceneV2.type === "preset" || event.effect.updateTypes.sceneV2.type === "presetAdvanced") {
                    const scene = dynamicScenes.find(scene => scene.name === event.effect.updateTypes.sceneV2.presetScene);
                    if (scene) {
                        promises.push(globals.govee.capabilities.setDynamicScene({ sku: device.sku, device: deviceId }, scene.paramId, scene.id));
                    }
                } else if (event.effect.updateTypes.sceneV2.type === "diy" || event.effect.updateTypes.sceneV2.type === "diyAdvanced") {
                    const scene = diyScenes.find(scene => scene.name === event.effect.updateTypes.sceneV2.diyScene);
                    if (scene) {
                        promises.push(globals.govee.capabilities.setDiyScene({ sku: device.sku, device: deviceId }, scene.value));
                    }
                }
            }
        }

        // if wait for execution is enabled, we can wait for all promises to resolve
        // await Promise.all(promises)
    }
};

export default effect;