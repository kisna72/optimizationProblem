import JobShopProblem from "./jobShop";
import { IOperation, IComplexOperation, ComplexOperationTypeEnum, IComplexOperationUnionList } from "./interface";
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


// console.log(job)
console.log(util.inspect(job, {showHidden: false, depth: null}))

job.solve([]);