import { Plugin } from "@crowbartools/firebot-types";
import uiExtension from "./frontend";
import govee from "./backend/govee";
import goveeDb from "./backend/database";
import goveeLogo from "./govee-logo.svg";
import updateGoveeDeviceEffect from "./backend/update-govee-device-effect";
import frontendCommunicator from "./backend/frontend-communicator";

const plugin: Plugin<Params> = {
    manifest: {
        name: "Govee Control",
        version: PLUGIN_VERSION,
        author: "DennisOnTheInternet",
        description: "Firebot plugin to control Govee devices like lights and power switches",
        tags: [
            "lights"
        ],
        repo: "https://github.com/dennisrijsdijk/firebot-govee-control",
        icon: {
            type: "custom",
            url: `data:image/svg+xml;base64,${goveeLogo}`,
            backgroundColor: "#53afff26"
        }
    },
    parametersSchema: [
        {
            name: "goveeApiKey",
            title: "Govee API Key",
            type: "password",
            default: ""
        }
    ],
    registers: {
        effects: [updateGoveeDeviceEffect],
        frontendListeners: frontendCommunicator.frontendListeners,
        uiExtensions: [uiExtension]
    },
    async onLoad(ctx) {
        await goveeDb.init()
        if (ctx.parameters.goveeApiKey && ctx.parameters.goveeApiKey.trim() !== "") {
            govee.apiKey = ctx.parameters.goveeApiKey;
            await goveeDb.fetchDevices();
        }
    },
    async onParameterUpdate(ctx) {
        if (ctx.parameters.goveeApiKey && ctx.parameters.goveeApiKey.trim() !== "") {
            govee.apiKey = ctx.parameters.goveeApiKey;
            await goveeDb.fetchDevices();
        }
    }
};

export default plugin;