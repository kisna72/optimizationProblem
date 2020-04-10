// This file contains classes for running job shop problems. 
import { IJob, IMachine } from "./interface";

class JobShopProblem {
    machines: Map<number,IMachine>; 
    job: IJob
    constructor(){
        this.machines = new Map()
    }
    addJob(){}
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