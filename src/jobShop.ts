// This file contains classes for running job shop problems. 
import { IJob, IMachine,  } from "./interface";

class JobShopProblem {
    machines: Map<string,string>; 
    job: IJob
    constructor(){
        this.machines = new Map()
        this.job = new Map()
    }
    addJob(){}
    addMachine(){}
}


export default JobShopProblem