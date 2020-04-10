interface IOperation {
    machine: number
    time: number // time in seconds
    displayTimeUnit: string // Unit to display for time. 
}

interface IJob {
    id: number
    name: string
    operations: (IOperation | ISequence)[]
}

interface ISequence {
    operations: (IOperation | ISequence)[]
}

interface IMachine {
    id: number
    name?: string 
    tags?: string[]
}

interface IMachineMap {
    map: Map<string, IMachine>
}

// One or the other
interface IJobArgument {
    SEQUENCE?: IOperation[]
    PARALLEL?: IOperation[]
}

export {
    IOperation,
    IJob,
    ISequence,
    IMachine,
    IMachineMap,
    IJobArgument,
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