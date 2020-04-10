import JobShopProblem from "./jobShop";
import { IJobArgument, IOperation, ICanRunInParallel, ICanRunInMultipleMachines, IComplexOperation } from "./interface";

console.log("I am running")


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
const expand: IOperation = {
    machine: e,
    time: 300
}
const purify: IOperation = {
    machine:p,
    time: 400
}
// Expand and Purify can happen in parallel
const expandAndPurify: ICanRunInParallel = {
    operations: [expand, purify]
}

const fill: ICanRunInMultipleMachines = {
    operations: [
        {
            machine: wa,
            time: 600
        },
        {
            machine:wb,
            time:500
        }
    ]
}
const cap: IOperation = {
    machine: c,
    time: 500
}
const label: IOperation = {
    machine: l,
    time: 50
}

const operations: IComplexOperation = [expandAndPurify, fill, cap, label]

console.log(job)