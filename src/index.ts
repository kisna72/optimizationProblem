import JobShopProblem from "./jobShop";

console.log("I am running")


const job = new JobShopProblem()
const id1:number = job.addMachine("Water Filling A", ['filling'] )
const id2:number = job.addMachine("Packing")
job.addJob()

console.log(job)