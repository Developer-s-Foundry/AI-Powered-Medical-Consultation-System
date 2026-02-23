export class BaseResponse {
     statusCode: number;
    message: string;
    data: any;

    constructor(statusCode: number, message: string, data?: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data; 
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data 
        }
    }
}
