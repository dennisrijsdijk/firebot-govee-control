import { RunRequest } from "@crowbartools/firebot-custom-scripts-types";
import GoveeApi from "./backend/govee";

export type Params = {
  goveeApiKey: string;
}

class PluginGlobals {
    private _goveeApi: GoveeApi;
    private _runRequest: RunRequest<Params>;
    private _pluginVersion: string;
    private _scriptDataDir: string;

    get govee() {
        return this._goveeApi;
    }

    set govee(goveeApi: GoveeApi) {
        this._goveeApi = goveeApi;
    }

    get runRequest(): RunRequest<Params> {
        return this._runRequest;
    }

    set runRequest(runRequest: RunRequest<Params>) {
        this._runRequest = runRequest;
    }

    get pluginVersion(): string {
        return this._pluginVersion;
    }

    set pluginVersion(version: string) {
        this._pluginVersion = version;
    }

    get scriptDataDir(): string {
        return this._scriptDataDir;
    }

    set scriptDataDir(scriptDataDir: string) {
        this._scriptDataDir = scriptDataDir;
    }
}

export default new PluginGlobals();