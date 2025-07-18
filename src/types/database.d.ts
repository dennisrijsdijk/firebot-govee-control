interface DatabaseSchema {
    /**
     * A dictionary of devices.
     * Each key is a device MAC address, and the value is a GoveeDevice object.
     */
    devices: Record<string, GoveeDevice>;
    /**
     * A dictionary of device groups.
     * Each key is a group ID, and the value is an object containing the group's name
     * and an array of device IDs that belong to that group.
     */
    deviceGroups: Record<string, { name: string; devices: Array<string> }>;
    /**
     * A dictionary of scenes.
     * Each key is a device SKU, and the value is an array of Scene objects.
     */
    dynamicScenes: Record<string, Array<DynamicScene>>;
    /**
     * A dictionary of DIY scenes.
     * Each key is a device SKU, and the value is an array of DiyScene objects.
     */
    diyScenes: Record<string, Array<DiyScene>>;
}