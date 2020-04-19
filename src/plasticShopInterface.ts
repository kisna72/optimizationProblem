import { ISKU, IJob } from "./interface";

enum MaterialEnum {
    ACETAL,
    PP
}

interface IPlasticsJob extends IJob {
    id: number|string 
    material: MaterialEnum
}

enum InjectionMachineClass {
    A, // light weight 
    B, // med tonnage
    C, // high tonnage
    D, // ultra high tonnage

}
interface IInjectionMoldingMachine {
    id:number
    name:string
    // maxTonnage?: number - Possible
    class: InjectionMachineClass
}
interface IMold {
    id:number
    class: InjectionMachineClass
    cavityCount?: number
    standardBase?: boolean //if true, then it can take in a standardMoldBase Cavity
}
interface ICavity {
    id: number
    mold: number
    sku: number
    inventory: number
    standardMoldBase?: boolean
}
// SKU is basicaly a job. it could have one or more operations
interface IPlasticsShopSKU extends ISKU {
    id: number
    requiredTonnage: number
    name: string // s800 flat top .. whatever ...
    material: IMaterial // acetal - used for calculating switchover cost . if material changes, it costs time to switch over. 
}
interface IInventoryData {
    id: number
    sku: IPlasticsShopSKU
    currentAvailable: number
    required:number
    deadline?:Date // without deadline, every solution will be feasible
}
interface IInspectorPacker {
    id: number
}
interface IMaterial {
    id: number
    name: string
}

export {
    InjectionMachineClass,
    IInjectionMoldingMachine,
    IMold,
    ICavity,
    IPlasticsShopSKU,
    IInventoryData,
    IInspectorPacker,
    IMaterial,
    IPlasticsJob,
    MaterialEnum
}