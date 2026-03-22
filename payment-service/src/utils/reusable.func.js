"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseResponse = void 0;
class BaseResponse {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data
        };
    }
}
exports.BaseResponse = BaseResponse;
