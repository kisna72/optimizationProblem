import JobShopProblem from "./jobShop";
import { IOperation, IComplexOperation, ComplexOperationTypeEnum, IComplexOperationUnionList, ISolutionParamters, JobShopAlgorithmEnum, RandomAlgorithmEnum } from "./interface";
const util = require('util');

import simpleJobShop from "./examples/simpleJobShop";
simpleJobShop()



const job = new JobShopProblem()

// Add all machines
const e:number = job.addMachine("Bottle Expansion")
const p:number = job.addMachine("Water Purifying")
const pClone:number = job.addMachine("Water Purifying")
const wa:number = job.addMachine("Filling A", ['filling'])
const wb:number = job.addMachine("Filling B", ['filling'])
const c:number = job.addMachine("Capping")
const l:number = job.addMachine("Labeling")

/**
 * Job -> Operations ...
 * addJob() will add jobs to the jobShopProblem.
 * SEQUENCE and PARALLEL
 * job is baically an array of sequence and parallels. 
 * job = sequence([operation1, operation2, parallell(operation3, operation4, sequence(operation5, operation6) ), operation7, operation8])
 */
const operationsFactory = (expandTime, purifyTime, fillTimeA, capTime, labelTime ) : IComplexOperationUnionList => {
    const expand: IOperation = {
        machine: e,
        time: expandTime
    }
    const purify: IOperation = {
        machine:p,
        time: purifyTime
    }
    const purifyC: IComplexOperation = {
        type: ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations: [
            {
                machine: p, 
                time: purifyTime
            },
            {
                machine: pClone,
                time: purifyTime
            }
        ]
    }
    // Expand and Purify can happen in parallel
    const expandAndPurify: IComplexOperation = {
        type:ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL,
        operations: [expand, purify]
    }

    const fill:IOperation = {
        machine:wa,
        time:fillTimeA
    }

    // const fill: IComplexOperation = {
    //     type:ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
    //     operations: [
    //         {
    //             machine: wa,
    //             time: fillTimeA
    //         },
    //         {
    //             machine:wb,
    //             time:fillTimeB
    //         }
    //     ]
    // }
    const cap: IOperation = {
        machine: c,
        time: capTime
    }
    const label: IOperation = {
        machine: l,
        time: labelTime
    }

    const operations: IComplexOperationUnionList = [expand, purifyC, fill, cap, label]
    return operations
}

const operations_a: IComplexOperationUnionList = operationsFactory(10, 30, 10,10,8)
job.addJob({
    id:5,
    name:"32 OZ Water Bottle",
    operations: operations_a,
    requiredInventory: 1
});
 
const operations_b: IComplexOperationUnionList = operationsFactory(50, 60, 10,10,16)
job.addJob({
    id:20,
    name:"16 OZ Water Bottle",
    operations: operations_b,
    requiredInventory: 1
});

const operations_c: IComplexOperationUnionList = operationsFactory(30, 90, 20, 10, 16)
job.addJob({
    id:30,
    name:"16 OZ Water Bottle",
    operations: operations_c,
    requiredInventory: 1
});
const operations_d: IComplexOperationUnionList = operationsFactory(15, 90, 20, 10, 10,)
job.addJob({
    id:40,
    name:"31 OZ Coca Cola",
    operations: operations_d,
    requiredInventory: 1
});

// const operations_e: IComplexOperationUnionList = operationsFactory(405, 240, 40, 500, 40, 80)
// job.addJob({
//     id:50,
//     name:"16 OZ Coca Cola",
//     operations: operations_e
// });

const operationsRandomFactory = (numberOfJobs) => {
    const randTime = () => Math.floor(Math.random() * 1000) // takes anywhere from 0 to 1000 time.
    for(let i = 0; i < numberOfJobs; i++){
        const operations_e: IComplexOperationUnionList = operationsFactory(randTime(), randTime(),randTime(), randTime(), randTime())
        job.addJob({
            id:i*3,
            name:"16 OZ Coca Cola",
            operations: operations_e,
            requiredInventory: 1
        });
    }
}

// randomly increase complexity of the problem for experiments ...
// operationsRandomFactory(100)

// console.log(job)
console.log(util.inspect(job, {showHidden: false, depth: null}))

const solParams:ISolutionParamters = {
    maxNumberOfSimulations:100,
    maxSecondsToRun: 5000,
    algorithm: JobShopAlgorithmEnum.HILL_CLIMBING,
    hillClimbingRandomRestartPercent: .0001, // restart 0.0001 percent of the time. Gives the algorithm enough time to discover a local minima.
    randomAlgorithm: RandomAlgorithmEnum.FISHERYATES
    // Smaller than number better chance the algorithm has to discover local minima... important during large 
}

job.setSolutionParameters(solParams)
const bestGanttChart = job.solve();
console.log("solving with norandom")
solParams.randomAlgorithm = RandomAlgorithmEnum.NORANDOM
solParams.maxNumberOfSimulations = 10
job.setSolutionParameters(solParams)
const bestGanttChart2  = job.solve();
console.log(bestGanttChart2)

const timeSlice  = 150
// Take the bestGanttChart, at a certain slice of time, and then... 
// create a new job with left over objects .. Each job will have a cost to move.
// Cost... 
// Start a hill climbing algorithm