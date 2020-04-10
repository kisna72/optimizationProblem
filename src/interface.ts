interface IMachine {
    id: number // this is the key from machineMap
    name?: string 
    tags?: string[]
};

type IComplexOperation = (IOperation | ICanRunInParallel | ICanRunInMultipleMachines)[];

interface IJob {
    id: number
    name: string
    operations: IComplexOperation
};

interface IOperation {
    machine: number // This is machine id from Machine Map
    time: number // time in seconds
    displayTimeUnit?: string // Unit to display for time. Not needed for seconds
};

// Jobs that CAN run in parallel
interface ICanRunInParallel {
    operations: IComplexOperation
};

// Just one need to run
interface ICanRunInMultipleMachines {
    operations: IComplexOperation
};

// One or the other
interface IJobArgument {
    SEQUENCE?: IOperation[]
    PARALLEL?: IOperation[]
};

export {
    IOperation,
    IJob,
    ICanRunInParallel,
    ICanRunInMultipleMachines,
    IMachine,
    IComplexOperation,
}


// enum timeUnits {
//     SECOND,
//     MINUTE,
//     HOUR,
//     DAY,
//     WEEK
// }
// interface TimeUnit {
//     unit: timeUnits
//     conversion: number // translate from seconds to this timeUnit. 1 for seconds, 60 for minuts, ...
// }