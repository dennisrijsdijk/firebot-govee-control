import globals from "../global";

export default {
    on<T extends keyof BackendCommunicatorCommands>(request: T, callback: (...args: BackendCommunicatorCommands[T]["args"]) => Promise<BackendCommunicatorCommands[T]["return"]>) {
        globals.runRequest.modules.frontendCommunicator.onAsync(request, async (args: BackendCommunicatorCommands[T]["args"]) => callback(...args));
    },
    async send<T extends keyof FrontendCommunicatorCommands>(request: T, ...args: FrontendCommunicatorCommands[T]["args"]) {
        return globals.runRequest.modules.frontendCommunicator.fireEventAsync(request, args) as FrontendCommunicatorCommands[T]["return"];
    }
}