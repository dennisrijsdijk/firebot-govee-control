import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { Params } from "./global";
import globals from "./global";
import initBackend from "./backend";
import initFrontend from "./frontend";

import packageJson from "../package.json";
import GoveeApi from "./backend/govee";


const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Govee Control",
      description: "Firebot script to control Govee devices like Lights and Power Switches",
      author: "DennisOnTheInternet",
      version: packageJson.version,
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
  run: (runRequest) => {
    globals.govee = new GoveeApi(runRequest.parameters.goveeApiKey);
    globals.runRequest = runRequest;
    globals.pluginVersion = packageJson.version;
    runRequest.modules.logger.info(`Govee Control plugin version: ${globals.pluginVersion}`);
    initBackend();
    initFrontend();
  },
  parametersUpdated: (parameters) => {
    if (parameters.goveeApiKey) {
      globals.govee.apiKey = parameters.goveeApiKey;
    }
  }
};

export default script;
