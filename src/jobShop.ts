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
    hillClimbingRandomRestartPercent: number
    terminationCriteriaFuncs:ITerminationCriteriaFunction[];
    best1Dsolution: number[] // Need to keep track of this for hill climbinh algorithm.
    best1DSolutionLocal: number[] //Local Minima used for random restarts with hill Climbing with restart algorithm
    bestMakeSpanLocal: number; 

    totalRestarts: number // how many times did we restart?

    defaultCostFunction: (a:number) => {}

    constructor(){
        this.machines = new Map()
        this.jobs = new Map()
        this.maxNumberOfSimulations = 100000 // default unless set otherwise
        this.maxSecondsToRun = 30 // default unless set otherwise.
        this.algorithm = JobShopAlgorithmEnum.RANDOM
        this.hillClimbingRandomRestartPercent = 1 // default use random in 1 percents of the calls. 
        this.totalRestarts = 0
        this.terminationCriteriaFuncs = this.generateDefaultTerminationCriteriaFunctions();
        this.bestMakeSpanLocal = Infinity
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
        if(params.hillClimbingRandomRestartPercent){
            this.hillClimbingRandomRestartPercent = params.hillClimbingRandomRestartPercent
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

    // UNUSED ... TODO > recursively count operations until everthing is counted correctly .... 
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
            if(scheduleSoFar.length === 0){
                ganttChartMachineMap.set(operation.machine, [jobId, startTime , endTime])
            } else {
                ganttChartMachineMap.set(operation.machine, [...scheduleSoFar, jobId, startTime, endTime])
            }

            return endTime
        }
        oned.forEach( (jobId, idx, arr) => {
            const job:IJob = this.jobs.get(jobId);
            const operationIndex:number = machineIndexTrackingMap.get(jobId)
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

            // at the end, incremebt the index of operation
            machineIndexTrackingMap.set(jobId, operationIndex+1 )
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
            arr = FisherYatesShuffle(arr)
            return arr
        }
        const swap = (base) => {
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

        if(!this.best1Dsolution){
            return getRandomArrayOfJobs()
        }

        if(this.algorithm === JobShopAlgorithmEnum.RANDOM){
            return getRandomArrayOfJobs()
        } else if (this.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING){
            return swap(this.best1Dsolution)
        } else if (this.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS){
            const randomPercent = Math.floor(Math.random() * 100) //uniformly spread out percent
            // eg: percent = 20.There is a 20% chance that randomPercent is 20 or less. 
            // so if randomPercent is 20 or less, we add randomness, else we keep hill climbing. 
            const useRandom = randomPercent < this.hillClimbingRandomRestartPercent ? true : false
            if(useRandom){
                this.totalRestarts += 1
                //makeSpansForCsv.push(90000)
                const oned = getRandomArrayOfJobs()
                this.best1DSolutionLocal = oned //rest best1DSolutionLocal
                this.bestMakeSpanLocal = Infinity
                return oned
            } else {
                return swap(this.best1DSolutionLocal)
            }
        } else {
            throw new Error("Not implemented")
        }
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
        console.log("solving")
        
        let currentSimCount = 0
        let terminateNow
        let bestGanttChart;
        let bestMakeSpan = +Infinity
        let bestMakeSpanIndex = 0
        let bestMakeSpanLocal = +Infinity

        const defaultTerminationArgs:ITerminationCriteriaFunctionArguments = {
            currentSimulationIndex: currentSimCount,
            simulationStartTime: new Date(),
            maxNumberOfSimulations: this.maxNumberOfSimulations,
            maxSecondsToRun:this.maxSecondsToRun,
            algorithm: this.algorithm,
        }

        while(!terminateNow) {
            // Update current Sim Count to run on termination criteria functions.
            defaultTerminationArgs.currentSimulationIndex = currentSimCount

            const terminatedList:boolean[] = this.terminationCriteriaFuncs.map(f => f(defaultTerminationArgs))
            terminateNow = terminatedList.reduce((prev, curr) => curr ? true: prev, false)
            // print to screen every so often
            if(currentSimCount % 10){
                process.stdout.write(`Running simulation ${currentSimCount} of ${this.maxNumberOfSimulations}. RS ${this.totalRestarts} Best MakeSpan so far ${bestMakeSpan} on simulation number ${bestMakeSpanIndex} \r`)
            }
            const oned = this.onedArrayOfJobs()
            const ganttChart:Map<number, number[]> =  this.oneDToGanttChart(oned)
            const makespan = this.costFunction(ganttChart);
            //console.log("makespan is ", makespan)
            if(makespan < bestMakeSpan){
                // output global makespan value here.
                bestMakeSpan = makespan
                bestGanttChart = ganttChart
                this.best1Dsolution = oned
                bestMakeSpanIndex = currentSimCount
            }

            if(this.algorithm === JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS){
                if(makespan < this.bestMakeSpanLocal){
                    // send makespan value here for hill climbing with restarts...
                    this.bestMakeSpanLocal = makespan
                    this.best1DSolutionLocal = oned
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

export default JobShopProblem
