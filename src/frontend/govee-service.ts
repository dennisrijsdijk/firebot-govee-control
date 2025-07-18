import { AngularJsFactory } from "@crowbartools/firebot-custom-scripts-types/types/modules/ui-extension-manager"

export type GoveeService = {
    devices: DatabaseSchema["devices"];
    deviceCount: number;
    deviceGroups: DatabaseSchema["deviceGroups"];
    deviceGroupCount: number;
    dynamicScenes: DatabaseSchema["dynamicScenes"];
    diyScenes: DatabaseSchema["diyScenes"];
    getDevices: () => Promise<DatabaseSchema["devices"]>;
    getDeviceGroups: () => Promise<DatabaseSchema["deviceGroups"]>;
    setDeviceGroups: (deviceGroups: DatabaseSchema["deviceGroups"]) => Promise<void>;
    getDynamicScenes: () => Promise<DatabaseSchema["dynamicScenes"]>;
    getDiyScenes: () => Promise<DatabaseSchema["diyScenes"]>;
    refreshDevices: () => Promise<void>;
    showAddOrEditDeviceGroupModal: () => void;
    showRefreshDevicesModal: () => void;
}

const factory: AngularJsFactory = {
    name: "goveeService",
    function: (backendCommunicator: any, modalService: any) => {
        const backendCommunicatorShim = {
            on<T extends keyof FrontendCommunicatorCommands>(request: T, callback: (...args: FrontendCommunicatorCommands[T]["args"]) => Promise<FrontendCommunicatorCommands[T]["return"]>) {
                backendCommunicator.onAsync(request, (args: FrontendCommunicatorCommands[T]["args"]) => callback(...args));
            },
            async send<T extends keyof BackendCommunicatorCommands>(request: T, ...args: BackendCommunicatorCommands[T]["args"]) {
                return await backendCommunicator.fireEventAsync(request, args) as BackendCommunicatorCommands[T]["return"];
            }
        }
        const service: Partial<GoveeService> = {
            devices: {},
            deviceCount: 0,
            deviceGroups: {},
            deviceGroupCount: 0,
            dynamicScenes: {},
            diyScenes: {},
            getDevices: async () => {
                service.devices = await backendCommunicatorShim.send("govee:get-devices");
                service.deviceCount = Object.keys(service.devices).length;
                return service.devices;
            },
            getDeviceGroups: async () => {
                service.deviceGroups = await backendCommunicatorShim.send("govee:get-device-groups");
                service.deviceGroupCount = Object.keys(service.deviceGroups).length;
                return service.deviceGroups;
            },
            setDeviceGroups: async (deviceGroups) => {
                service.deviceGroups = deviceGroups;
                service.deviceGroupCount = Object.keys(deviceGroups).length;
                return backendCommunicatorShim.send("govee:set-device-groups", deviceGroups);
            },
            getDynamicScenes: async () => {
                service.dynamicScenes = await backendCommunicatorShim.send("govee:get-dynamic-scenes");
                return service.dynamicScenes;
            },
            getDiyScenes: async () => {
                service.diyScenes = await backendCommunicatorShim.send("govee:get-diy-scenes");
                return service.diyScenes;
            },
            refreshDevices: async () => {
                return backendCommunicatorShim.send("govee:fetch-devices").then(async () => {
                    await Promise.all([
                        service.getDevices(),
                        service.getDeviceGroups(),
                        service.getDynamicScenes(),
                        service.getDiyScenes()
                    ]);
                });
            },
            showAddOrEditDeviceGroupModal: (groupId?: string) => {
                modalService.showModal({
                    component: "addOrEditGoveeDeviceGroupModal",
                    size: "sm",
                    resolveObj: {
                        id: () => groupId
                    }
                });
            },
            showRefreshDevicesModal: () => {
                modalService.showModal({
                    component: "refreshDevicesModal",
                    size: "sm"
                });
            }
        };

        Promise.all([
            service.getDevices(),
            service.getDeviceGroups(),
            service.getDynamicScenes(),
            service.getDiyScenes()
        ]);

        return service;
    }
}

export default factory;