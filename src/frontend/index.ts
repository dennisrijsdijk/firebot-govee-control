import globals from "../global";
import addOrEditDeviceGroupModal from "./add-or-edit-govee-device-group-modal";
import GoveeService from "./govee-service";
import page from "./page";
import refreshDevicesModal from "./refresh-devices-modal";

export default function initFrontend() {
    globals.runRequest.modules.uiExtensionManager.registerUIExtension({
        id: "dennisontheinternet:govee-control",
        pages: [ page ],
        providers: {
            components: [ addOrEditDeviceGroupModal, refreshDevicesModal ],
            factories: [ GoveeService ]
        }
    });
}