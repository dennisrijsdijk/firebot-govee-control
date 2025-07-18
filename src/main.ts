import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { Params } from "./global";
import globals from "./global";
import { initBackend, fetchDevices } from "./backend";
import initFrontend from "./frontend";
import GoveeApi from "./backend/govee";


const script: Firebot.CustomScript<Params> = {
    getScriptManifest: () => {
        return {
            name: "Govee Control",
            description: "Firebot script to control Govee devices like Lights and Power Switches",
            author: "DennisOnTheInternet",
            version: PLUGIN_VERSION,
            firebotVersion: "5",
            startupOnly: true,
        };
    },
    getDefaultParameters: () => {
        return {
            goveeApiKey: {
                type: "password",
                default: "",
                description: "Govee API Key",
                secondaryDescription: "Enter your Govee API key here",
                title: "Govee API Key",
            },
        };
    },
    run: async (runRequest) => {
        // @ts-expect-error
        if (runRequest.scriptDataDir) {
            // @ts-expect-error
            globals.scriptDataDir = runRequest.scriptDataDir;
        } else {
            const scriptNameNormalized = (await script.getScriptManifest()).name.replace(/[#%&{}\\<>*?/$!'":@`|=\s-]+/g, "-").toLowerCase();
            globals.scriptDataDir = runRequest.modules.path.join(SCRIPTS_DIR, "..", "script-data", scriptNameNormalized);
        }
        if (!runRequest.modules.fs.existsSync(globals.scriptDataDir)) {
            runRequest.modules.fs.mkdirSync(globals.scriptDataDir, { recursive: true });
        }
        globals.runRequest = runRequest;
        globals.pluginVersion = PLUGIN_VERSION;
        runRequest.modules.logger.info(`Govee Control plugin version: ${globals.pluginVersion}`);
        globals.govee = new GoveeApi(runRequest.parameters.goveeApiKey);
        initBackend();
        initFrontend();
    },
    parametersUpdated: async (parameters) => {
        if (parameters.goveeApiKey) {
            globals.govee.apiKey = parameters.goveeApiKey;
            await fetchDevices();
        }
    }
};

export default script;
