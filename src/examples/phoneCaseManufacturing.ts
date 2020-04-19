const util = require('util');
import { PlasticsShop } from "../plasticsShop";
import { IOperation, IComplexOperation, ComplexOperationTypeEnum, JobShopAlgorithmEnum, IResource, ResourceTypeEnum, MaterialEnum } from "../interfaces/interface";
/**
 * In this fictional example, we will use PlasticsShop class to find optimal solution for how to manufacture three cases 
 * - IPhone 11 Case using Acetal Material 
 * - Galaxy Case using PP Material 
 * - Mac Book using Acetal Material 
 * 
 * We have Two IMM Machines, and 2 packing person. Each case has to run through IMM Machine and then get packaged.
 * 
 * Each job has a setup time, and if there is a material change, we will incur additional time cleaning out the old material so IMM is fresh
 */

export default () => { // Wrap with arrow function so we can import in index.ts file

    const pj = new PlasticsShop()

    // Add Machines
    const imm1: number = pj.addMachine("IMM 1")
    const imm2: number = pj.addMachine("IMM 2")
    // const imm3: number = pj.addMachine("IMM 3")
    const person1: IResource  = {
        name: "Packaging Person 1",
        type: ResourceTypeEnum.PERSON
    }
    const person2: IResource  = {
        name: "Packaging Person 2",
        type: ResourceTypeEnum.PERSON
    }
    const p1Id = pj.addResource(person1);
    const p2Id = pj.addResource(person2)


    // Add Job 1: IPhone 11 Case Acetal 
    const immStepForIphoneCaseAcetal:IComplexOperation = {
        type: ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations: [
            {
                machine: imm1,
                time: 20
            },
            {
                machine: imm2,
                time: 25
            }
        ]
    }

    const packingStepForIphoneCaseAcetal:IOperation = {
        machine: p1Id,
        time: 5
    }

    pj.addJob({
        id:"IPhone 11 Case Acetal",
        name:"IPhone 11 Case Acetal",
        operations: [immStepForIphoneCaseAcetal, packingStepForIphoneCaseAcetal],
        requiredInventory: 100,
        material: MaterialEnum.ACETAL
    })

    // Add Job 2: Galaxy Phone case in PP Material 
    const immStepForGalaxyPhoneCasePP:IComplexOperation = {
        type: ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations:[
            {
                machine: imm1,
                time: 25
            },
            {
                machine: imm2,
                time: 30
            }
        ]
    }
    const packagingStepForGalaxyPhoneCasePP:IOperation = {
        machine:p1Id,
        time:5
    }
    pj.addJob({
        id:"Galaxy Case PP",
        name:"Galaxy Case PP",
        operations: [immStepForGalaxyPhoneCasePP, packagingStepForGalaxyPhoneCasePP],
        requiredInventory: 100,
        material: MaterialEnum.PP
    })

    // Add Job 3: Mac Book Acetal Case 
    // TRY : Switching the times to 80 and 90 seconds .. which negates the material switch over time...
    const immStepForMacBookCaseAcetal:IComplexOperation = {
        type: ComplexOperationTypeEnum.CAN_RUN_IN_MULTIPLE_MACINES,
        operations:[
            {
                machine: imm1,
                time: 25
            },
            {
                machine: imm2,
                time: 30
            }
        ]
    }
    const packagingStepForMacBookCaseAcetal:IOperation = {
        machine:p2Id,
        time:90
    }
    pj.addJob({
        id:"Macbook Acetal",
        name:"Macbook Acetal",
        operations: [immStepForMacBookCaseAcetal, packagingStepForMacBookCaseAcetal],
        requiredInventory: 100,
        material: MaterialEnum.ACETAL
    })

    pj.setSolutionParameters({
        maxNumberOfSimulations:10000,
        algorithm: JobShopAlgorithmEnum.HILL_CLIMBING_WITH_RESTARTS
    })
    const ganttChart = pj.solve()
    console.log(util.inspect(ganttChart, {showHidden: false, depth: null}))
    //console.log(ganttChart)

}
