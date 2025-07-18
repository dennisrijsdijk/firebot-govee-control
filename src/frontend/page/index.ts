import { AngularJsPage } from "@crowbartools/firebot-custom-scripts-types/types/modules/ui-extension-manager";
import template from "./index.html";
import { type GoveeService } from "../govee-service";

type Scope = ng.IScope & {
    goveeService: GoveeService;
};

const page: AngularJsPage = {
    id: "dennisontheinternet:govee-control",
    name: "Govee Control",
    icon: "fa-lightbulb",
    type: "angularjs",
    fullPage: true,
    disableScroll: true,
    template,
    controller: async ( $scope: Scope, goveeService: GoveeService ) => {
        $scope.goveeService = goveeService;
    }
};

export default page;