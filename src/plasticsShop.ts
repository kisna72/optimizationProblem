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
    IActivePlasticsJob,
    IResource,
    ISolutionParamters,
    ITerminationCriteriaFunction,
    ITerminationCriteriaFunctionArguments,
    ISearchSpaceRandomGenerator,
    IBestSolution,
    JobShopAlgorithmEnum,
    RandomAlgorithmEnum
} from "./interfaces/interface";
import { FisherYatesShuffle, isArrayOfSameItems } from "./helpers"

/**
 * Plastics Shop allows us to modify the onedToGanttChart function so that we can 
 * - redefine the cost function by accounting for job switch and material switch costs (time)
 * - Use IPlasticsJob data type for jobs which includes additional property such as material property 
 * - redefine onedtoGanttChart function to account for the job switch time and material switch time
 * 
 *  Future Features
 *  Assets required as a constraint, 
 *  Hot Job Insertion, Scheduling On Top of existing runs
 */
class PlasticsShop {
    jssp:JobShopProblem;
    jobSwitchTimePenalty:number
    materialSwitchTimePenalty:number
    inventory: Map<number, IInventory>// number represents JobId
    jobs: Map<ID, IPlasticsJob>
    runningJobs: Map<ID, IActivePlasticsJob> // What jobs are running right now? 

    constructor(){
        this.jssp = new JobShopProblem()
        this.jobSwitchTimePenalty = 60 * 60 // 60 mins converted to seconds
        this.materialSwitchTimePenalty = 2 * 60 * 60 //2 hours converted to seconds
        this.jobs = new Map()
        this.runningJobs = new Map()
    }
    // Update definition of Plastics Job
    addJob(job:IPlasticsJob):void {
        this.jobs.set(job.id, job)
        // this.calculateNumberOfOperations()
    }
    addRunningJob(job: IActivePlasticsJob): void {
        // console.log("adding running job to ", this.runningJobs)
        this.runningJobs.set(job.id, job)
        this.jobs.set(job.id, job)
    }
    addMachine(name:string, tags?: string[]){
        return this.jssp.addMachine(name, tags);
    }
    addResource(resource:IResource){
        return this.jssp.addResource(resource);
    }
    setSolutionParameters(params:ISolutionParamters):void {
        this.jssp.setSolutionParameters(params);
    }
    addTerminationCriteria(terminationFunction:ITerminationCriteriaFunction){
        this.jssp.addTerminationCriteria(terminationFunction);
    }
    isOperationComplex(operation: IComplexOperationUnion){
        return this.jssp.isOperationComplex(operation);
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
        this.jssp.resources.forEach((value,key) => {
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
        const runningMachineJobIndexTrackingMap:Map<ID, ID> = new Map() // key is macine ID, and value is Job ID
        this.runningJobs.forEach((runningJob, key) => {
            runningMachineJobIndexTrackingMap.set(runningJob.machine, runningJob.id)
        })

        // Helper to add operation to the earliest machine Available
        const addOperationToSchedule = (operation:IOperation, jobId:number) => {
            const machineForCurrentOperation = this.jssp.resources.get(operation.machine)
            
            const scheduleSoFar = ganttChartMachineMap.get(operation.machine)
            const earliestMachineAvailableTime = scheduleSoFar.length === 0 ? 0 :scheduleSoFar[scheduleSoFar.length-1][2] + 1
            const earliestJobStartTime = jobEarliestStartMap.get(jobId);
            const job:IPlasticsJob = this.jobs.get(jobId);
            const startTime = Math.max(earliestMachineAvailableTime, earliestJobStartTime)
            const endTime = startTime + (operation.time * job.requiredInventory)
            
            // Check if this machine had a job running.
            const machineForCurrentOperationHasRunningJob = runningMachineJobIndexTrackingMap.has(operation.machine)
            const runningJobIsDifferentThanSelectedJob = runningMachineJobIndexTrackingMap.get(operation.machine) === job.id
            // if schedule is empty, check if machine for current operation has running jobs and if running Job is different than selectedJob
            if(scheduleSoFar.length === 0){
                if(machineForCurrentOperationHasRunningJob && runningJobIsDifferentThanSelectedJob){
                    // First we need to add switching cost.
                    const switchFromRunningJobCost:IScheduleTuple = ["Switch Running Job",startTime, startTime + this.jobSwitchTimePenalty ]
                    const runningJobId = runningMachineJobIndexTrackingMap.get(operation.machine)
                    scheduleSoFar.push(switchFromRunningJobCost)
                    // If material of new jobis different than running job, we need to material switching cost. 
                    const runningJob = this.jobs.get(runningJobId);
                    if(job.material !== runningJob.material){
                        const scheduleWithMaterialPenalty:IScheduleTuple = ["Switch Material", scheduleSoFar[scheduleSoFar.length -1][2], scheduleSoFar[scheduleSoFar.length -1][2] + this.materialSwitchTimePenalty ]
                        scheduleSoFar.push(scheduleWithMaterialPenalty)
                    }
                    scheduleSoFar.push([job.id, scheduleSoFar[scheduleSoFar.length -1][2], scheduleSoFar[scheduleSoFar.length -1][2] + job.requiredInventory * operation.time])
                    // ganttChartMachineMap.set("metadata", [["Had to Switch Jobs", 1,1] ]) // Just for Debugging Purpose
                } else {
                    const operationSchedule:IScheduleTuple = [job.id, startTime, endTime]
                    scheduleSoFar.push(operationSchedule)   
                }
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
            }
            ganttChartMachineMap.set(operation.machine, scheduleSoFar)
            return scheduleSoFar[scheduleSoFar.length-1][2]
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
    onedArrayOfJobs(){
        const getRandomArrayOfJobs = () => {
            let arr = []
            this.jobs.forEach( (v,k) => {
                const opcount = v.operations.length
                const a = new Array(opcount).fill(k)
                arr = arr.concat(a)
            })
            if(this.jssp.randomAlgorithm === RandomAlgorithmEnum.NORANDOM){
                return arr 
            }
            arr = FisherYatesShuffle(arr)
            return arr
        }
        const swap = (base) => {
            if(isArrayOfSameItems(base)){
                return base
            }
            const randi = Math.floor(Math.random() * base.length )
            let randj = Math.floor(Math.random() * base.length )
            while(base[randi] === base[randj]){ // no point in swapping the same number.
                randj = Math.floor(Math.random() * base.length )
            }
            const randiVal = base[randi]
            base[randi] = base[randj]
            base[randj] = randiVal
            return base
        }
        if(!this.jssp.best1Dsolution){
            return getRandomArrayOfJobs()
        }

        if(this.jssp.algorithm === JobShopAlgorithmEnum.RANDOM){
            return getRandomArrayOfJobs()
        } else if (this.jssp.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING){
            return swap(this.jssp.best1Dsolution)
        } else if (this.jssp.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS){
            const randomPercent = Math.random() * 100
            // eg: percent = 20.There is a 20% chance that randomPercent is 20 or less. 
            // so if randomPercent is 20 or less, we add randomness, else we keep hill climbing. 
            const useRandom = randomPercent < this.jssp.hillClimbingRandomRestartPercent ? true : false
            if(useRandom){
                this.jssp.totalRestarts += 1
                //makeSpansForCsv.push(90000)
                const oned = getRandomArrayOfJobs()
                this.jssp.best1DSolutionLocal = oned //rest best1DSolutionLocal
                this.jssp.bestMakeSpanLocal = Infinity
                return oned
            } else {
                return swap(this.jssp.best1DSolutionLocal)
            }
        } else {
            throw new Error("Not implemented")
        }
    }

    // Generic Function that keeps track of how many simulations have run so far - Just an Idea .... NOT USED 
    genericSolver(
        searchSpaceRandomGenerator:ISearchSpaceRandomGenerator,
        convertSearchSpaceToSolutionSpace:any,
        fitnessFunction:any,
        defaultTerminationArgs:ITerminationCriteriaFunctionArguments, 
        terminationCriteriaFuncs:ITerminationCriteriaFunction[],
        loggerFunction:any){
        
        let terminationCriteriaMet = false
        let currentSimCount = 0
        const bestSolution: IBestSolution = {
            bestSolutionSpaceRepresentation:undefined, // This is Gantt Chart
            bestSearchSpaceRepresentation:undefined, // 1D representation
            bestCostFunctionEval:undefined, // This is the MakeSpan
            bestSolutionFoundAtIndex:0 // 
        }

        defaultTerminationArgs.simulationStartTime = new Date()

        while(!terminationCriteriaMet){
            loggerFunction()
            const searchSpace:number[] = searchSpaceRandomGenerator(bestSolution)
            const ganttChart = convertSearchSpaceToSolutionSpace(searchSpace)
            const costVal = fitnessFunction(ganttChart)


            currentSimCount += 1
            defaultTerminationArgs.currentSimulationIndex = currentSimCount
            terminationCriteriaMet = terminationCriteriaFuncs.map(f => f(defaultTerminationArgs)).reduce((prev, curr) => curr ? true: prev, false)
        }
    }
    solve(){
        // requires Job
        console.log("solving")
        
        let currentSimCount = 0
        let terminateNow
        let bestGanttChart;
        let bestMakeSpan = +Infinity
        let bestMakeSpanIndex = 0

        const defaultTerminationArgs:ITerminationCriteriaFunctionArguments = {
            currentSimulationIndex: currentSimCount,
            simulationStartTime: new Date(),
            maxNumberOfSimulations: this.jssp.maxNumberOfSimulations,
            maxSecondsToRun:this.jssp.maxSecondsToRun,
            algorithm: this.jssp.algorithm,
        }
        console.log("defaultTermination",  defaultTerminationArgs)

        while(!terminateNow) {
            // Update current Sim Count to run on termination criteria functions.
            defaultTerminationArgs.currentSimulationIndex = currentSimCount

            const terminatedList:boolean[] = this.jssp.terminationCriteriaFuncs.map(f => f(defaultTerminationArgs))
            terminateNow = terminatedList.reduce((prev, curr) => curr ? true: prev, false)
            // print to screen every so often
            if(currentSimCount % 10){
                process.stdout.write(`Running simulation ${currentSimCount} of ${this.jssp.maxNumberOfSimulations}. RS ${this.jssp.totalRestarts} Best MakeSpan so far ${bestMakeSpan} on simulation number ${bestMakeSpanIndex} \r`)
            }
            const oned = this.onedArrayOfJobs()
            // console.log(oned)
            const ganttChart:Map<ID,IScheduleTuple[]> =  this.oneDToGanttChart(oned)
            // if(ganttChart.has("metadata")){
            //     console.log("example of job switching")
            //     console.log(ganttChart)
            //     console.log("=======")
            // }
            const makespan = this.costFunction(ganttChart);
            if(makespan < bestMakeSpan){
                // output global makespan value here.
                bestMakeSpan = makespan
                bestGanttChart = ganttChart
                this.jssp.best1Dsolution = oned
                bestMakeSpanIndex = currentSimCount
            }

            if(this.jssp.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS){
                if(makespan < this.jssp.bestMakeSpanLocal){
                    // send makespan value here for hill climbing with restarts...
                    this.jssp.bestMakeSpanLocal = makespan
                    this.jssp.best1DSolutionLocal = oned
                }
            }
            currentSimCount += 1
        }

        console.log("Termination criteria passed")
        console.log("shortest makespan is ", bestMakeSpan)
        // console.log(bestGanttChart)
        return {
            bestGanttChart,
            bestMakeSpan,
            bestMakeSpanIndex
        }
    }
}

export { PlasticsShop }