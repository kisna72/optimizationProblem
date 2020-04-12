# optimizationProblem

Want to run discreet optimization problems purely in javascript? You are in the right place.

## FAQ

1. Isn't javascript slow? Why run compute intensive code with javascript? 

I haven't run benchmarks of this code against other libraries or professional software like CPLEX, however
if you are a javascript developer you will spend a lot less time using this library than learning another 
tool. Additionally, the library is able to come up with a fairly good solution in less than a minute for 
jobs with more than 100 Jobs with 5 operations each. Plus you can always tweak the parameters to speed it up. 

The reason I built this in javascript is to help people who already have nodejs based application that needs a 
light weight optimization algorithm. 


2. What type of optimization is supported?

At the moment, only Job Shop type problems can be solved. I say Job Shop Type because you can solve problems 
that have N number of things that need to be done in some order with some constraints. 

Send examples of problems you are working on, and i can add it to the library. 

3. Why Typescript?

Maintenance becomes easier for me. Valid javascript is valid typescript so typescript provides an optional type checking. 



## How to use the library?

### Running Independently 
If you aren't running the library in another project, best option is to clone the project locally by running 
`git clone https://github.com/kisna72/optimizationProblem.git`

cd into the folder and install all dependencies with yarn.
`cd optimizationProblem && yarn install` 

use yarn to start the server. It is setup to use `ts-node-dev` that watches for changes to the file and re-runs the file allowing you to
develop easier. 

Modify `index.ts` file to develop your model. 

### Importing inside other javascript project. 
This library is written in Typescript so if your project is javascript you'll need to transpile it. Follow the steps above, then run 
`npx tsc .\src\jobShop.ts` which will product a javascript file you can import into your project. 

### Import the library and instantiate
Import the library to your project. If you want to experiment, feel free to add this code to index.js file. 

```
import JobShopProblem from "./jobShop";
const job = new JobShopProblem()
```

### Add Machines

Add machines to the job. 

```
const m1:number = job.addMachine("House Framing")
const m2:number = job.addMachine("House Roofing")
// Add all the other machines
```

### Add Job and Operations for Each Job

A Machine can have one or more operations. 

#### Simple Example 
If you have two jobs that run certain number of operations, 
```
const framingH1: IOperation = {
    machine: m1,
    time: 400 // in seconds
}

const roofingH1 = IOperation = {
    machine: m2,
    time: 200 // in seconds
}

const operationsSmallHouse: IComplexOperationUnionList = [framingH1, roofingH1]

const framingH2: IOperation = {
    machine: m1,
    time: 800 // in seconds
}

const roofingH2 = IOperation = {
    machine: m2,
    time: 200 // in seconds
}

const operationsLargeHouse: IComplexOperationUnionList = [framingH2, roofingH2]

job.addJob({
    id:1,
    name:"Small House",
    operations: operationsSmallHouse
});

job.addJob({
    id:1,
    name:"Small House",
    operations: operationsLargeHouse
});

```

Next, provide solution paramter and solve 

```
const solParams:ISolutionParamters = {
    maxNumberOfSimulations:100000,
    maxSecondsToRun: 500,
    algorithm: JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS,
    hillClimbingRandomRestartPercent: .0001 // restart 0.0001 percent of the time. Gives the algorithm enough time to discover a local minima.
    // Smaller than number better chance the algorithm has to discover local minima... important during large 
}

job.setSolutionParameters(solParams)
const bestGanttChart = job.solve();
// DO things with bestGanttChart
console.log("done")
```

#### Case when Multiple Machine can run the same job


The way to do this is to provide a complexOperation  as follows:
Type of `ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES` tells the solver that it can run in multiple machines.
Next, under operations, you must provide different machine and time taken. The solver will choose one of these operations
and run them.

```
const fill: IComplexOperation = {
        type:ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations: [
            {
                machine: wa,
                time: fillTimeA
            },
            {
                machine:wb,
                time:fillTimeB
            }
        ]
    }

```

#### Case when jobs do not have to run in sequence

In this library, it is assumed that if your operations are in a list, that means they must be run in order. 
However, There are cases where two jobs can run in sequence (as in do not require one to run before other). 

you define those jobs with `type:ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL` option:

```
const expandAndPurify: IComplexOperation = {
    type:ComplexOperationTypeEnum.CAN_RUN_IN_PARALLEL,
    operations: [expand, purify]
}
```


