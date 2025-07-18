type RequestMap = Record<string, { args: any[]; return: any }>;

// Backend -> Frontend
type FrontendCommunicatorCommands = {
}

// Frontend -> Backend
type BackendCommunicatorCommands = {
    "govee:get-devices": {
        args: [];
        return: DatabaseSchema["devices"];
    };
    "govee:get-device-groups": {
        args: [];
        return: DatabaseSchema["deviceGroups"];
    };
    "govee:set-device-groups": {
        args: [deviceGroups: DatabaseSchema["deviceGroups"]];
        return: void;
    };
    "govee:get-dynamic-scenes": {
        args: [];
        return: DatabaseSchema["dynamicScenes"];
    };
    "govee:get-diy-scenes": {
        args: [];
        return: DatabaseSchema["diyScenes"];
    };
    "govee:fetch-devices": {
        args: [];
        return: void;
    };
}