import JobShopProblem from "./jobShop";
import { IJobArgument } from "./interface";

console.log("I am running")


const job = new JobShopProblem()
const id1:number = job.addMachine("Water Filling A", ['filling'] )
const id2:number = job.addMachine("Packing")

/**
 * Job -> Operations ...
 * addJob() will add jobs to the jobShopProblem.
 * SEQUENCE and PARALLEL
 * job is baically an array of sequence and parallels. 
 * job = sequence([operation1, operation2, parallell(operation3, operation4, sequence(operation5, operation6) ), operation7, operation8])
 */
const jobs:IJobArgument = {
    SEQUENCE: [
        {id:1,machine:3,}
    ]
}
job.addJob()

console.log(job)