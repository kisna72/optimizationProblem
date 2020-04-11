import JobShopProblem from "./jobShop";
import { IOperation, IComplexOperation, ComplexOperationTypeEnum, IComplexOperationUnionList, ISolutionParamters, JobShopAlgorithmEnum } from "./interface";
const util = require('util');

const job = new JobShopProblem()

// Add all machines
const e:number = job.addMachine("Bottle Expansion")
const p:number = job.addMachine("Water Purifying")
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
const operationsFactory = (expandTime, purifyTime, fillTimeA, fillTimeB, capTime, labelTime ) : IComplexOperationUnionList => {
    const expand: IOperation = {
        machine: e,
        time: expandTime
    }
    const purify: IOperation = {
        machine:p,
        time: purifyTime
    }
    // Expand and Purify can happen in parallel
    const expandAndPurify: IComplexOperation = {
        type:ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL,
        operations: [expand, purify]
    }

    const fill: IComplexOperation = {
        type:ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations: [
            {
                machine: wa,
                time: fillTimeA
            },
            {
                machine:wb,
                time:fillTimeB
            }
        ]
    }
    const cap: IOperation = {
        machine: c,
        time: capTime
    }
    const label: IOperation = {
        machine: l,
        time: labelTime
    }

    const operations: IComplexOperationUnionList = [expandAndPurify, fill, cap, label]
    return operations
}

const operations_a: IComplexOperationUnionList = operationsFactory(100, 30, 400,300,50,150)
job.addJob({
    id:5,
    name:"32 OZ Water Bottle",
    operations: operations_a
});
 
const operations_b: IComplexOperationUnionList = operationsFactory(50, 15, 200,150,50,50)
job.addJob({
    id:20,
    name:"16 OZ Water Bottle",
    operations: operations_b
});

const operations_c: IComplexOperationUnionList = operationsFactory(40, 24, 40, 500, 20, 40)
job.addJob({
    id:30,
    name:"16 OZ Water Bottle",
    operations: operations_c
});
const operations_d: IComplexOperationUnionList = operationsFactory(405, 240, 40, 500, 40, 80)
job.addJob({
    id:40,
    name:"16 OZ Coca Cola",
    operations: operations_d
});

const operations_e: IComplexOperationUnionList = operationsFactory(405, 240, 40, 500, 40, 80)
job.addJob({
    id:50,
    name:"16 OZ Coca Cola",
    operations: operations_e
});

const operationsRandomFactory = (numberOfJobs) => {
    const randTime = () => Math.floor(Math.random() * 1000) // takes anywhere from 0 to 1000 time.
    for(let i = 0; i < numberOfJobs; i++){
        const operations_e: IComplexOperationUnionList = operationsFactory(randTime(), randTime(),randTime(), randTime(), randTime(), randTime())
        job.addJob({
            id:i*3,
            name:"16 OZ Coca Cola",
            operations: operations_e
        });
    }
}

operationsRandomFactory(100)

// console.log(job)
console.log(util.inspect(job, {showHidden: false, depth: null}))

const solParams:ISolutionParamters = {
    maxNumberOfSimulations:1000,
    maxSecondsToRun: 500,
    algorithm: JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS,
    hillClimbingRandomRestartPercent: 0.0001 // restart 0.001 percent of the time. Gives the algorithm enough time to discover a local minima
}

job.setSolutionParameters(solParams)
const solution = job.solve();

console.log("done")
// // Experiment on which algorithm is better. 
// const rand = []
// const randMakeSpan = []
// const hill = []
// const hillMakeSpan = []
// const hillres = []
// const hillResMakeSpan = []
// for(let i = 0 ; i < 10; i++){
//     console.log("running index ", i)
//     const solParams:ISolutionParamters = {
//         maxNumberOfSimulations:10000,
//         maxSecondsToRun: 500,
//         algorithm: JobShopAlgorithmEnum.RANDOM,
//         //hillClimbingRandomRestartPercent: 0.0001 // restart 0.001 percent of the time. Gives the algorithm enough time to discover a local minima
//     }

//     job.setSolutionParameters(solParams)
//     const { bestMakeSpanIndex, bestMakeSpan } = job.solve()
//     rand.push(bestMakeSpanIndex)
//     randMakeSpan.push(bestMakeSpan)
    
//     solParams.algorithm = JobShopAlgorithmEnum.HILL_CLIMBING
//     job.setSolutionParameters(solParams)
//     const solHill = job.solve()
//     hill.push(solHill.bestMakeSpanIndex)
//     hillMakeSpan.push(solHill.bestMakeSpan)

//     solParams.algorithm = JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS
//     solParams.hillClimbingRandomRestartPercent = 0.0001
//     job.setSolutionParameters(solParams)
//     const solHillRes = job.solve()
//     hillres.push(solHillRes.bestMakeSpanIndex)
//     hillResMakeSpan.push(solHillRes.bestMakeSpan)
// }
// function getAvg(grades) {
//     const total = grades.reduce((acc, c) => acc + c, 0);
//     return total / grades.length;
// }
  
// console.log("rand", getAvg(rand))
// console.log("rand", getAvg(randMakeSpan))
// console.log("hill", getAvg(hill))
// console.log("hill", getAvg(hillMakeSpan))
// console.log("hillres", getAvg(hillres))
// console.log("hillres", getAvg(hillResMakeSpan))