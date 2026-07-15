type RequestMap = Record<string, { args: any[]; return: any }>;

// Backend -> Frontend
type FrontendCommunicatorCommands = {
}

// Frontend -> Backend
type BackendCommunicatorCommands = {
    "dennisontheinternet:govee:get-devices": {
        args: [];
        return: DatabaseSchema["devices"];
    };
    "dennisontheinternet:govee:get-device-groups": {
        args: [];
        return: DatabaseSchema["deviceGroups"];
    };
    "dennisontheinternet:govee:set-device-groups": {
        args: [deviceGroups: DatabaseSchema["deviceGroups"]];
        return: void;
    };
    "dennisontheinternet:govee:get-dynamic-scenes": {
        args: [];
        return: DatabaseSchema["dynamicScenes"];
    };
    "dennisontheinternet:govee:get-diy-scenes": {
        args: [];
        return: DatabaseSchema["diyScenes"];
    };
    "dennisontheinternet:govee:fetch-devices": {
        args: [];
        return: void;
    };
}