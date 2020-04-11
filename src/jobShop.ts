// This file contains classes for running job shop problems. 
import { 
    IComplexOperationUnion, 
    IJob, 
    IMachine, 
    IOperation, 
    ComplexOperationTypeEnum, 
    IComplexOperation, 
    ITerminationCriteriaFunctionArguments,
    ITerminationCriteriaFunction, 
    JobShopAlgorithmEnum, 
    ISolutionParamters,
} from "./interface";
import { FisherYatesShuffle } from "./helpers";

class JobShopProblem {
    
    machines: Map<number,IMachine>; 
    jobs: Map<number, IJob>
    maxNumberOfSimulations: number | null
    maxSecondsToRun: number // Can never be null 
    algorithm: JobShopAlgorithmEnum
    terminationCriteriaFuncs:ITerminationCriteriaFunction[]; 
    defaultCostFunction: (a:number) => {}

    constructor(){
        this.machines = new Map()
        this.jobs = new Map()
        this.maxNumberOfSimulations = 100000 // default unless set otherwise
        this.maxSecondsToRun = 30 // default unless set otherwise.
        this.algorithm = JobShopAlgorithmEnum.RANDOM
        this.terminationCriteriaFuncs = this.generateDefaultTerminationCriteriaFunctions();
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
    setSolutionParameters(params:ISolutionParamters):void {
        if(params.maxNumberOfSimulations) {
            this.maxNumberOfSimulations = params.maxNumberOfSimulations
        }
        if(params.maxSecondsToRun) {
            this.maxSecondsToRun =  params.maxSecondsToRun
        }
        if(params.algorithm){
            this.algorithm = params.algorithm
        }
    }
    addTerminationCriteria(terminationFunction:ITerminationCriteriaFunction){
        // add a new termination criteria
        this.terminationCriteriaFuncs.push(terminationFunction)
        return this.terminationCriteriaFuncs
    }

    /**
     * SOLVER FUNCTIONS 
     */
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
        oned.forEach( (jobId, idx, arr) => {
            // create a schedule for this job.
            // console.log("===========START JOB =================") 
            // console.log("job id value", jobId)
            const job:IJob = this.jobs.get(jobId);
            //console.log(job)
            const operationIndex:number = machineIndexTrackingMap.get(jobId)
            // console.log("operation index is ", operationIndex)
            const operation = job.operations[operationIndex]
            // console.log("running operation ", operation)
            
            // adding to schedule 
            if(this.isOperationComplex(operation)){
                const complexOperation = <IComplexOperation>operation // Cast to complex operation type
                // console.log(complexOperation.type, ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES)
                if(complexOperation.type === ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL){
                    const endTimes = complexOperation.operations.map((operation:IOperation, idx) => {
                        const endTime = addOperationToSchedule(operation, jobId);
                        return endTime
                    })
                    const maxEndTime = Math.max(...endTimes)
                    jobEarliestStartMap.set(jobId, maxEndTime + 1);

                } else if(complexOperation.type = ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES){
                    // console.log("CAN RUN in MULTIPLE MACINES")
                    // in this case, we just choose one. Future Upgrade, we could just generate multiple gantt chart based on each machine ..
                    const randomlyChoosenOperationFromMultipleMachineOptions:IComplexOperationUnion = complexOperation.operations[Math.floor(Math.random()*complexOperation.operations.length)]
                    // console.log("randomly choosing a operation ", randomlyChoosenOperationFromMultipleMachineOptions)
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

            // console.log(ganttChartMachineMap)

            // console.log("++++++++++++++ END JOB +++++++++++++++++++++") 


        })
        return ganttChartMachineMap
    }

    onedArrayOfJobs(){
        // console.log("array of jobs", this.jobs)
        let arr = []
        this.jobs.forEach( (v,k) => {
            const opcount = v.operations.length
            const a = new Array(opcount).fill(k)
            arr = arr.concat(a)
        })
        arr = FisherYatesShuffle(arr)
        // console.log(arr)
        return arr
    }

    costFunction(ganttChart:Map<number, number[]>){
        const makeSpan = Array.from(ganttChart.values()).reduce((prev, currentListOfSchedules) => {
            const lastTime:number = currentListOfSchedules[currentListOfSchedules.length -1]
            if(lastTime >  prev){
                return lastTime
            }
            return prev
        }, 0)
        return makeSpan
    }

    generateDefaultTerminationCriteriaFunctions(): ITerminationCriteriaFunction[] {
        const funcs:ITerminationCriteriaFunction[] = []
        if(this.maxNumberOfSimulations){
            const terminateBasedOnNumberOfSimulations:ITerminationCriteriaFunction = function(args:ITerminationCriteriaFunctionArguments ){
                if(args.currentSimulationIndex > args.maxNumberOfSimulations){
                    return true
                }
                return false //otherwise return false
            }
            funcs.push(terminateBasedOnNumberOfSimulations)
        }

        if(this.maxSecondsToRun){
            const terminateBasedOnMaxSecondsSinceStart:ITerminationCriteriaFunction = function(args:ITerminationCriteriaFunctionArguments){
                const terminationTime:Date = new Date(args.simulationStartTime.getTime())
                terminationTime.setSeconds( terminationTime.getSeconds() + args.maxSecondsToRun)
                if(new Date() > terminationTime ){
                    return true
                }
                return false
            } 
            funcs.push(terminateBasedOnMaxSecondsSinceStart)
        }
        return funcs
    }


    solve(){
        let currentSimCount = 0

        const defaultTerminationArgs:ITerminationCriteriaFunctionArguments = {
            currentSimulationIndex: currentSimCount,
            simulationStartTime: new Date(),
            maxNumberOfSimulations: this.maxNumberOfSimulations,
            maxSecondsToRun:this.maxSecondsToRun,
            algorithm: this.algorithm,
        }

        console.log("solving")
        let terminateNow
        let bestGanttChart;
        let bestMakeSpan = +Infinity
        while(!terminateNow) {
            // Update current Sim Count to run on termination criteria functions.
            defaultTerminationArgs.currentSimulationIndex = currentSimCount

            const terminatedList:boolean[] = this.terminationCriteriaFuncs.map(f => f(defaultTerminationArgs))
            terminateNow = terminatedList.reduce((prev, curr) => curr ? true: prev, false)
            // print to screen every so often
            if(currentSimCount % 10){
                process.stdout.write(`Running simulation ${currentSimCount} of ${this.maxNumberOfSimulations}\r`)
            }
            const oned = this.onedArrayOfJobs()
            const ganttChart:Map<number, number[]> =  this.oneDToGanttChart(oned)
            const makespan = this.costFunction(ganttChart);
            //console.log("makespan is ", makespan)
            if(makespan < bestMakeSpan){
                bestMakeSpan = makespan
                bestGanttChart = ganttChart
            }
            currentSimCount += 1
        }

        console.log("Termination criteria passed")
        console.log("shortest makespan is ", bestMakeSpan)
        console.log(bestGanttChart)
    }
}


export default JobShopProblem
