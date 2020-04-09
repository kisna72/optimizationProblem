interface IJob {
    
}

interface IMachine {
    id: Number
    name?: String 
    tags?: String[]
}

interface IMachineMap {
    map: Map<string, IMachine>
}

export {
    IJob,
    IMachine,
    IMachineMap
}