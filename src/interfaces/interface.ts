enum ResourceTypeEnum {
    MACHINE,
    PERSON
}
interface IResource {
    id?: number // this is the key from machineMap
    type?: ResourceTypeEnum
    name?: string 
    tags?: string[]
};


interface ISKU {
    id: number
    name: string
}

interface IInventory {
    id: number
    skuId: number // ISKU.id
    existingInventory: number
    requiredInventory: number   
}

interface IAsset {
    id: number
    machine?: number
    sku?: number
}

// Use I prefix for types to make it easy to use auto complete. 
type IComplexOperationUnion = IOperation | IComplexOperation;
type IComplexOperationUnionList = (IOperation | IComplexOperation )[];
type ID = number | string
type IScheduleTuple = [ID, number, number]

// Why send all these to every termination argument? because it allows us to 
// create a generic terminal function that can be run reliably. 
interface ITerminationCriteriaFunctionArguments {
    currentSimulationIndex:number
    simulationStartTime:Date
    maxNumberOfSimulations: number
    maxSecondsToRun: number
    algorithm: JobShopAlgorithmEnum
}

interface ITerminationCriteriaFunction {
    (args: ITerminationCriteriaFunctionArguments):boolean
}

interface ICostFunction {
    ():number
}

interface IJob {
    id: number
    name: string
    operations: IComplexOperationUnionList
    requiredInventory: number
    running?: boolean // If this job is already running    
};

interface IOperation {
    machine: number // This is machine id from Machine Map
    time: number // time in seconds
    displayTimeUnit?: string // Unit to display for time. Not needed for seconds
};

enum ComplexOperationTypeEnum {
    SIMPLE,
    CAN_RUN_IN_PARALLEL,
    CAN_RUN_IN_MULTIPLE_MACINES
}
interface IComplexOperation {
    type: ComplexOperationTypeEnum
    operations: IComplexOperationUnionList // hence allowing us to infintely nest
}

enum JobShopAlgorithmEnum {
    RANDOM, //
    HILL_CLIMBING,
    HILL_CLIMBING_WITH_RESTARTS,
    // GENETIC_ALGORITHM
}
enum RandomAlgorithmEnum {
    FISHERYATES,
    NORANDOM // this will cause every simulation to run with same job ... only used for benchmarking...
}

interface ISolutionParamters {
    maxNumberOfSimulations?: number
    maxSecondsToRun?: number
    algorithm?: JobShopAlgorithmEnum
    hillClimbingRandomRestartPercent?: number
    randomAlgorithm?: RandomAlgorithmEnum
}

enum MaterialEnum {
    ACETAL,
    PP
}

interface IPlasticsJob extends IJob {
    id: number|string 
    material: MaterialEnum
}


export {
    IOperation,
    IJob,
    IResource,
    ISKU,
    IInventory,
    IAsset,
    IComplexOperation,
    IComplexOperationUnion,
    IComplexOperationUnionList,
    ComplexOperationTypeEnum,
    ITerminationCriteriaFunction,
    ITerminationCriteriaFunctionArguments,
    JobShopAlgorithmEnum,
    ISolutionParamters,
    ICostFunction,
    RandomAlgorithmEnum,
    ResourceTypeEnum,
    IScheduleTuple,
    ID,
    MaterialEnum,
    IPlasticsJob
}
