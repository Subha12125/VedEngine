export const  healthCheckController = (request, reply) =>{
    return {
        reply: "Perfectly healthy response from VedEnginee Backend",
        status: "!! OK !!",
        service: "VedEnginee Backend",
        serverTime: new Date().toISOString()
    }
}