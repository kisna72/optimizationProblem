interface IMachine {
    id: number // this is the key from machineMap
    name?: string 
    tags?: string[]
};

type IComplexOperationUnion = (IOperation | IComplexOperation )[];

interface IJob {
    id: number
    name: string
    operations: IComplexOperationUnion
};

interface IOperation {
    machine: number // This is machine id from Machine Map
    time: number // time in seconds
    displayTimeUnit?: string // Unit to display for time. Not needed for seconds
};

enum ComplexOperationTypeEnum {
    CAN_RUN_IN_PARALLEL,
    CAN_RUN_IN_MULTIPLE_MACINES
}
interface IComplexOperation {
    type: ComplexOperationTypeEnum
    operations: IComplexOperationUnion // hence allowing us to infintely nest
}

export {
    IOperation,
    IJob,
    IMachine,
    IComplexOperation,
    IComplexOperationUnion,
    ComplexOperationTypeEnum
}
