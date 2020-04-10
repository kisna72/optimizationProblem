// This file contains classes for running job shop problems. 
import { IJob, IMachine, IOperation,  } from "./interface";

class JobShopProblem {
    machines: Map<number,IMachine>; 
    jobs: Map<number, IJob>
    constructor(){
        this.machines = new Map()
        this.jobs = new Map()
    }
    addJob(job:IJob){
        this.jobs.set(job.id, job)
    }
    addOperation(jobKey: number){

    }
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
}


export default JobShopProblem