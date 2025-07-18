import { AngularJsComponent } from "@crowbartools/firebot-custom-scripts-types/types/modules/ui-extension-manager";
import template from "./index.html";
import { type GoveeService } from "../govee-service";

type Scope = ng.IScope & {
    $ctrl: any;
}

const component: AngularJsComponent = {
    name: "refreshDevicesModal",
    template,
    bindings: {
        resolve: "<",
        close: "&",
        dismiss: "&",
        modalInstance: "<"
    },
    controller: ($scope: Scope, goveeService: GoveeService) => {
        goveeService.refreshDevices().then(() => {
            $scope.$ctrl.dismiss();
        });
    }
};

export default component;