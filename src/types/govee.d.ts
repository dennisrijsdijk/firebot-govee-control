type ApiCommandDevice = {
    sku: string;
    device: string;
}

type EnumCapability = {
    instance: string;
    parameters: {
        dataType: 'ENUM';
        options: Array<{
            name: string;
            value: number;
        }>;
    };
    type: string;
}

type IntegerCapability = {
    instance: string;
    parameters: {
        dataType: 'INTEGER';
        range: {
            min: number;
            max: number;
            precision: number;
        },
        unit?: string;
    },
    type: string;
}

type EnumStructField = {
    dataType: 'ENUM';
    fieldName: string;
    options: Array<{
        name: string;
        value: number;
    }>;
    required: boolean;
}

type IntegerStructField = {
    dataType: 'INTEGER';
    fieldName: string;
    range: {
        min: number;
        max: number;
        precision: number;
    },
    required: boolean;
    unit?: string;
}

type StructCapability = {
    instance: string;
    parameters: {
        dataType: 'STRUCT';
        fields: Array<EnumStructField | IntegerStructField>;
    }
    type: string;
}

type SimpleCommandCapability = {
    type: string;
    instance: string;
    value: number;
}

type StructCommandCapability = {
    type: string;
    instance: string;
    value: Record<string, number>;
}

type Capability = EnumCapability | IntegerCapability | StructCapability;

type CommandCapability = SimpleCommandCapability | StructCommandCapability;

type GoveeDevice = ApiCommandDevice & {
    deviceName: string;
    type: string;
    capabilities: Array<Capability>;
}

type GetDevicesResponse = {
    code: number;
    message: string;
    data: GoveeDevice[];
}

type GetStateResponse = {
    requestId: string;
    msg: string;
    code: number;
    payload: {
        sku: string;
        device: string;
        capabilities: Array<{
            instance: string;
            type: string;
            value: number | string;
        }>;
    }
}

type MusicModeParameters = {
    musicMode: number;
    sensitivity: number;
    autoColor?: boolean;
    rgb?: string;
}