import { RunRequest } from "@crowbartools/firebot-custom-scripts-types";

export type Params = {
  goveeApiKey: string;
}

class PluginGlobals {
    private _goveeApi: any;
    private _runRequest: RunRequest<Params>;

    get govee() {
        return this._goveeApi;
    }

    set govee(goveeApi: any) {
        this._goveeApi = goveeApi;
    }

    get runRequest(): RunRequest<Params> {
        return this._runRequest;
    }

    set runRequest(runRequest: RunRequest<Params>) {
        this._runRequest = runRequest;
    }
}

export default new PluginGlobals();