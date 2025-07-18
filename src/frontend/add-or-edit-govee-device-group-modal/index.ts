import { AngularJsComponent } from "@crowbartools/firebot-custom-scripts-types/types/modules/ui-extension-manager";
import template from "./index.html";
import { type GoveeService } from "../govee-service";

type Scope = ng.IScope & {
    $ctrl: any;
    goveeService: GoveeService;
    isNewDeviceGroup: boolean;
    deviceGroup: {
        name: string;
        id: string;
        devices: string[];
    };
    devices: Array<{ id: string; deviceName: string }>;
}

const component: AngularJsComponent = {
    name: "addOrEditGoveeDeviceGroupModal",
    template,
    bindings: {
        resolve: "<",
        close: "&",
        dismiss: "&",
        modalInstance: "<"
    },
    controller: ($scope: Scope, goveeService: GoveeService, logger: any, modalFactory: any) => {
        const $ctrl = $scope.$ctrl;
        $scope.devices = Object.entries(goveeService.devices).map(([id, device]) => ({
            id,
            deviceName: device.deviceName
        }));
        $scope.isNewDeviceGroup = true;

        $scope.deviceGroup = {
            name: "",
            id: "",
            devices: []
        };

        $ctrl.$onInit = () => {
            if ($ctrl.resolve.id != null) {
                const id = structuredClone($ctrl.resolve.id);
                if (!Object.keys(goveeService.deviceGroups).includes(id)) {
                    return;
                }
                $scope.deviceGroup = {
                    id,
                    ...structuredClone(goveeService.deviceGroups[id])
                };
                $scope.isNewDeviceGroup = false;
            }
        };

        $ctrl.nameIsTaken = (name: string) => {
            if (name == null || name === "") {
                return false;
            }
            const lowerName = name.toLowerCase().replaceAll(" ", "");
            const group = Object.entries(goveeService.deviceGroups).find(([id, group]) => {
                return group.name.toLowerCase().replaceAll(" ", "") === lowerName && id !== $scope.deviceGroup.id;
            });

            return group != null;
        }

        $ctrl.save = () => {
            if (!$scope.deviceGroup.name || $scope.deviceGroup.name.trim() === "") {
                logger.debug("Device group name is required");
                // todo: show error message to user
                return;
            }
            if ($ctrl.nameIsTaken($scope.deviceGroup.name)) {
                logger.debug("Device group name is already taken");
                // todo: show error message to user
                return;
            }
            
            if ($scope.isNewDeviceGroup) {
                $scope.deviceGroup.id = crypto.randomUUID();
            }

            goveeService.deviceGroups[$scope.deviceGroup.id] = {
                name: $scope.deviceGroup.name,
                devices: $scope.deviceGroup.devices
            };

            goveeService.setDeviceGroups(goveeService.deviceGroups).then(() => {
                $ctrl.close();
            });
        }

        $ctrl.confirmDelete = () => {
            if ($scope.isNewDeviceGroup) {
                return;
            }
            modalFactory.showConfirmationModal({
                title: "Delete Device Group",
                question: `Are you sure you want to delete the device group "${$scope.deviceGroup.name}"? This action cannot be undone.`,
                confirmLabel: "Remove",
                confirmBtnType: "btn-danger"
            }).then((confirmed: boolean) => {
                if (confirmed) {
                    delete goveeService.deviceGroups[$scope.deviceGroup.id];
                    goveeService.setDeviceGroups(goveeService.deviceGroups).then(() => {
                        $ctrl.close();
                    });
                }
            });
        };
    }
};

export default component;