import JobShopProblem from "../jobShop";
import { IOperation, IComplexOperationUnionList, ISolutionParamters, JobShopAlgorithmEnum, RandomAlgorithmEnum } from "../interfaces/interface";
const util = require('util');


export default () => { // wrap it inside default export function so we can import at will in index.ts file

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
        const fill:IOperation = {
            machine:wa,
            time:fillTimeA
        }
        const cap: IOperation = {
            machine: c,
            time: capTime
        }
        const label: IOperation = {
            machine: l,
            time: labelTime
        }
        const operations: IComplexOperationUnionList = [expand, purify, fill, cap, label]
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
    console.log(bestGanttChart);

}