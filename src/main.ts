import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

import { Params } from "./global";
import globals from "./global";
import initBackend from "./backend";
import initFrontend from "./frontend";


const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Govee Control",
      description: "Firebot script to control Govee devices like Lights and Power Switches",
      author: "DennisOnTheInternet",
      version: "1.0",
      firebotVersion: "5",
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
    globals.runRequest = runRequest;
    initBackend();
    initFrontend();
  },
};

export default script;
