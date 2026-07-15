import firebot, { FrontendListener } from "@crowbartools/firebot-types";
import goveeDb from "./database";

const frontendListeners: FrontendListener[] = [
    {
        eventName: "dennisontheinternet:govee:fetch-devices",
        useAsync: true,
        handler: async () => goveeDb.fetchDevices()
    },
    {
        eventName: "dennisontheinternet:govee:get-devices",
        useAsync: true,
        handler: async () => goveeDb.getDevices()
    },
    {
        eventName: "dennisontheinternet:govee:get-device-groups",
        useAsync: true,
        handler: async () => goveeDb.getDeviceGroups()
    },
    {
        eventName: "dennisontheinternet:govee:set-device-groups",
        useAsync: true,
        handler: async (args) => goveeDb.setDeviceGroups(args as DatabaseSchema["deviceGroups"])
    },
    {
        eventName: "dennisontheinternet:govee:get-dynamic-scenes",
        useAsync: true,
        handler: async () => goveeDb.getDynamicScenes()
    },
    {
        eventName: "dennisontheinternet:govee:get-diy-scenes",
        useAsync: true,
        handler: async () => goveeDb.getDiyScenes()
    }
]

export default {
    async send<T extends keyof FrontendCommunicatorCommands>(request: T, ...args: FrontendCommunicatorCommands[T]["args"]) {
        return firebot.frontendCommunicator.fireEventAsync(request, args) as FrontendCommunicatorCommands[T]["return"];
    },
    frontendListeners
}