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
        this.machines.forEach((value,key) => {
            ganttChartMachineMap.set(key,[])
        })
        const machineIndexTrackingMap:Map<number, number> = new Map() // could do this with array. just easier to read with Map
        this.jobs.forEach((value, key) => {
            machineIndexTrackingMap.set(key,0) // start on zero index
        })
        const jobEarliestStartMap:Map<number, number> = new Map()
        this.jobs.forEach((value, key) => {
            jobEarliestStartMap.set(key, 0)
        })

        // Helper to add operation 
        const addOperationToSchedule = (operation:IOperation, jobId:number) => {
            const scheduleSoFar = ganttChartMachineMap.get(operation.machine)
            const earliestMachineAvailableTime = scheduleSoFar.length === 0 ? 0 :scheduleSoFar[scheduleSoFar.length-1] + 1
            const earliestJobStartTime = jobEarliestStartMap.get(jobId);
            const startTime = Math.max(earliestMachineAvailableTime, earliestJobStartTime)
            const endTime = startTime + operation.time
            // console.log("schedule before updating ", scheduleSoFar)
            if(scheduleSoFar.length === 0){
                ganttChartMachineMap.set(operation.machine, [jobId, startTime , endTime])
            } else {
                ganttChartMachineMap.set(operation.machine, [...scheduleSoFar, jobId, startTime, endTime])
            }

            return endTime
            // console.log("schedule after updating",   ganttChartMachineMap.get(operation.machine))
        }
        console.log(" ")
        console.log(" ")
        console.log(" ")
        oned.forEach( (jobId, idx, arr) => {
            // create a schedule for this job.
            console.log("===========START JOB =================") 
            console.log("job id value", jobId)
            const job:IJob = this.jobs.get(jobId);
            //console.log(job)
            const operationIndex:number = machineIndexTrackingMap.get(jobId)
            console.log("operation index is ", operationIndex)
            const operation = job.operations[operationIndex]
            console.log("running operation ", operation)
            
            // adding to schedule 
            if(this.isOperationComplex(operation)){
                const complexOperation = <IComplexOperation>operation // Cast to complex operation type
                console.log(complexOperation.type, ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES)
                if(complexOperation.type === ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL){
                    const endTimes = complexOperation.operations.map((operation:IOperation, idx) => {
                        const endTime = addOperationToSchedule(operation, jobId);
                        return endTime
                    })
                    const maxEndTime = Math.max(...endTimes)
                    jobEarliestStartMap.set(jobId, maxEndTime + 1);

                } else if(complexOperation.type = ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES){
                    console.log("CAN RUN in MULTIPLE MACINES")
                    // in this case, we just choose one. Future Upgrade, we could just generate multiple gantt chart based on each machine ..
                    const randomlyChoosenOperationFromMultipleMachineOptions:IComplexOperationUnion = complexOperation.operations[Math.floor(Math.random()*complexOperation.operations.length)]
                    console.log("randomly choosing a operation ", randomlyChoosenOperationFromMultipleMachineOptions)
                    const endTime = addOperationToSchedule(<IOperation>randomlyChoosenOperationFromMultipleMachineOptions, jobId); // cast before sending .
                    jobEarliestStartMap.set(jobId, endTime +1 );
                } else {
                    throw new Error("Type not supported yet")
                }
            } else {
                // if operation is not complex, we simply add the operation to the schedule.
                const _operation = <IOperation>operation
                const endTime = addOperationToSchedule(_operation, jobId);
                jobEarliestStartMap.set(jobId, endTime + 1);
            }

            // at the end, incremebt the index of operation
            machineIndexTrackingMap.set(jobId, operationIndex+1 )

            console.log(ganttChartMachineMap)

            console.log("++++++++++++++ END JOB +++++++++++++++++++++") 

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