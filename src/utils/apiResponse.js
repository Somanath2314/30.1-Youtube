class apiResponse{
    constructor(statusCode, message, data){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode<=200
    }
}

export default apiResponse;