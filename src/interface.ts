interface IMachine {
    id: number // this is the key from machineMap
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

type IComplexOperationUnion = IOperation | IComplexOperation;
type IComplexOperationUnionList = (IOperation | IComplexOperation )[];

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
    randomAlgorithm: RandomAlgorithmEnum
}

export {
    IOperation,
    IJob,
    IMachine,
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
    RandomAlgorithmEnum
}
