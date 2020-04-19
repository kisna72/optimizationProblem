import JobShopProblem from "./jobShop";
import {
    ID,
    IScheduleTuple,
    IComplexOperationUnion, 
    IInventory,
    IOperation, 
    ComplexOperationTypeEnum, 
    IComplexOperation, 
    ResourceTypeEnum,
    IPlasticsJob,
} from "./interfaces/interface";

/**
 * Plastics Shop allows us to modify the onedToGanttChart function so that we can allocate the cost of switching jobs as well as switching materials
 * 
 */
class PlasticsShop extends JobShopProblem {
    jobSwitchTimePenalty:number
    materialSwitchTimePenalty:number
    inventory: Map<number, IInventory>// number represents JobId
    jobSwitchJobId: number
    materialSwitchJobId: number
    jobs: Map<ID, IPlasticsJob>

    constructor(){
        super()
        this.jobSwitchTimePenalty = 60 * 60 // 60 mins converted to seconds
        this.materialSwitchTimePenalty = 2 * 60 * 60 //2 hours converted to seconds
        this.jobSwitchJobId = -1 // switch over
        this.materialSwitchJobId = -2 // switch over + material change
    }

    // Update definition of Plastics Job
    addJob(job:IPlasticsJob):void{
        this.jobs.set(job.id, job)
        // this.calculateNumberOfOperations()
    }
    
    costFunction(ganttChart:Map<ID,IScheduleTuple[]>){
        const makeSpan = Array.from(ganttChart.values()).reduce((prev, currentListOfScheduleTuple) => {
            let lastTime:number;
            if(currentListOfScheduleTuple.length === 0){
                lastTime = 0
            } else {
                lastTime = currentListOfScheduleTuple[currentListOfScheduleTuple.length -1][2]
            }
            // console.log("last time, " , lastTime)
            if(lastTime >  prev){
                return lastTime
            }
            return prev
        }, 0)
        return makeSpan
    }
    /**
     * Converts OneD to Gantt Chart 
     * 
     * Job shop problem class implements this function which is overridden for plasticsShop.
     * For Plastics Shop, there is always a switch over cost when we change jobs.
     * If two consecutive jobs use different material, There is extra switchover cost
     * @param oned 
     */
    oneDToGanttChart(oned: number[]): Map<ID,IScheduleTuple[]> {
        const ganttChartMachineMap:Map<ID,IScheduleTuple[]> = new Map() // number is machine ID,  and number[] is schedule for machine. [ Job id, starttime, endTime, ...repeat ]
        this.resources.forEach((value,key) => {
            ganttChartMachineMap.set(key,[])
        })
        const jobOperationIndexTrackingMap:Map<ID, number> = new Map() // could do this with array. just easier to read with Map
        this.jobs.forEach((value, key) => {
            jobOperationIndexTrackingMap.set(key,0) // start on zero index as in first operation.
        })
        const jobEarliestStartMap:Map<ID, number> = new Map()
        this.jobs.forEach((value, key) => {
            jobEarliestStartMap.set(key, 0)
        })

        // Helper to add operation 
        const addOperationToSchedule = (operation:IOperation, jobId:number) => {
            const machineForCurrentOperation = this.resources.get(operation.machine)
            
            const scheduleSoFar = ganttChartMachineMap.get(operation.machine)
            const earliestMachineAvailableTime = scheduleSoFar.length === 0 ? 0 :scheduleSoFar[scheduleSoFar.length-1][2] + 1
            const earliestJobStartTime = jobEarliestStartMap.get(jobId);
            const job:IPlasticsJob = this.jobs.get(jobId);
            const startTime = Math.max(earliestMachineAvailableTime, earliestJobStartTime)
            const endTime = startTime + (operation.time * job.requiredInventory)

            if(scheduleSoFar.length === 0){
                // TODO > if this job starts at a slice of time of ganttChart, usually you run it to add a new job, and to find the best
                // way to add the new job, 
                // if the job was 'running' and is switched - meaning new job or just run something else, 
                // add a switch cost Plus material switch cost if aplicable here also
                const operationSchedule:IScheduleTuple = [job.id, startTime, endTime]
                ganttChartMachineMap.set(operation.machine, [operationSchedule])
            } else {
                if(machineForCurrentOperation.type === ResourceTypeEnum.MACHINE){
                    const lastJobId = scheduleSoFar[scheduleSoFar.length - 1][0]
                    const lastJob:IPlasticsJob = this.jobs.get(lastJobId)
                    // TODO > Only some operations cost penalty - not every one..
                    let scheduleWithPenalties:IScheduleTuple = ["Switch Jobs", startTime, startTime + this.jobSwitchTimePenalty ]
                    scheduleSoFar.push(scheduleWithPenalties);
                    if(lastJob.material !== job.material) {
                        // just add the switching cost.
                        const materialSwitchStartTime = startTime + this.jobSwitchTimePenalty
                        const materialSwitchEndTime = materialSwitchStartTime + this.materialSwitchTimePenalty
                        const scheduleWithMaterialPenalty:IScheduleTuple = ["Switch Material", materialSwitchStartTime, materialSwitchEndTime]
                        scheduleSoFar.push(scheduleWithMaterialPenalty)
                    }
                    const startAfterPenalties = scheduleSoFar[scheduleSoFar.length -1 ][2] + 1
                    const endAfterPenalties = startAfterPenalties +(operation.time * job.requiredInventory)
                    const operationSchedule:IScheduleTuple = [job.id, startAfterPenalties, endAfterPenalties]
                    scheduleSoFar.push(operationSchedule)
                    return endAfterPenalties
                } else {
                    const operationSchedule:IScheduleTuple = [job.id, startTime, endTime]
                    scheduleSoFar.push(operationSchedule)
                }
                ganttChartMachineMap.set(operation.machine, scheduleSoFar)
            }

            return endTime
        }
        oned.forEach( (jobId, idx, arr) => {
            const job:IPlasticsJob = this.jobs.get(jobId);
            const operationIndex:number = jobOperationIndexTrackingMap.get(jobId)
            const operation = job.operations[operationIndex]
            
            // adding to schedule 
            if(this.isOperationComplex(operation)){
                const complexOperation = <IComplexOperation>operation // Cast to complex operation type
                if(complexOperation.type === ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL){
                    const endTimes = complexOperation.operations.map((operation:IOperation, idx) => {
                        const endTime = addOperationToSchedule(operation, jobId);
                        return endTime
                    })
                    const maxEndTime = Math.max(...endTimes)
                    jobEarliestStartMap.set(jobId, maxEndTime + 1);

                } else if(complexOperation.type = ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES){
                    const randomlyChoosenOperationFromMultipleMachineOptions:IComplexOperationUnion = complexOperation.operations[Math.floor(Math.random()*complexOperation.operations.length)]
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

            // at the end, incremebt the index of operation ...
            // Open Question? What if the job is of type CAN_BE_SPLIT in 4 equal parts?
            jobOperationIndexTrackingMap.set(jobId, operationIndex+1 )
        })
        return ganttChartMachineMap
    }
}

export { PlasticsShop }



