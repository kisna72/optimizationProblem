// This file contains classes for running job shop problems. 
import { IComplexOperationUnion, IJob, IMachine, IOperation, ComplexOperationTypeEnum, IComplexOperation } from "./interface";
import { FisherYatesShuffle } from "./helpers";

class JobShopProblem {
    machines: Map<number,IMachine>; 
    jobs: Map<number, IJob>
    constructor(){
        this.machines = new Map()
        this.jobs = new Map()
    }
    addJob(job:IJob){
        this.jobs.set(job.id, job)
        // this.calculateNumberOfOperations()
    }
    addOperation(jobKey: number){}
    updateOperation(jobKey: number){}
    /**
     * Returns ID of the newly added Machine
     * @param name 
     * @param tags 
     */
    addMachine(name:string, tags?:string[]){
        const id = Array.from(this.machines.keys()).reduce( (prev: number, curr: number) => curr >= prev ? curr + 1 : prev, 0)
        const machine: IMachine = {
            id:id,
            name:name,
            ...(tags && {tags:tags})
        }
        this.machines.set(id, machine)
        return id
    }
    isOperationComplex(operation: IComplexOperationUnion){
        return operation.hasOwnProperty("type") && operation.hasOwnProperty("operations")
    }

    // TODO > Keep digging in the job until all operations are counted....
    countOperations(job:IJob) :number {
        let count = 0
        job.operations.forEach((op:IComplexOperationUnion) => {
            if(this.isOperationComplex(op)){
                const _op = <IComplexOperation>op
                if(_op.type === ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL){
                    const _operations = <IOperation[]>_op.operations
                    count += _operations.length
                } else {
                    count += 1
                }
            } else {
                count += 1
            }
        })
        console.log("number of operations is ", count)
        return count
    }

    oneDToGanttChart(oned){
        const ganttChartMachineMap:Map<number,number[]> = new Map()
        this.machines.forEach( (value,key) => {
            ganttChartMachineMap.set(key,[])
        })


    }

    onedArrayOfJobs(){
        console.log("array of jobs", this.jobs)
        let arr = []
        this.jobs.forEach( (v,k) => {
            const opcount = v.operations.length
            const a = new Array(opcount).fill(k)
            arr = arr.concat(a)
        })
        arr = FisherYatesShuffle(arr)
        console.log(arr)
        return arr
    }

    solve(){
        console.log("solving")
        // step 1: Look at jobs and machines, and generate a 1D array of jobs
        const oned = this.onedArrayOfJobs()
        this.oneDToGanttChart(oned)
    }
}


export default JobShopProblem