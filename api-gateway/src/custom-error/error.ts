export class AppError extends Error{
    statusCode: number;
    status: string;
    isOperational: boolean

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}