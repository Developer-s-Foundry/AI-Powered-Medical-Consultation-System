

export interface ResetToken {
    token: string;
    expiresAt: Date;
}

export interface ResponseData {
    statusCode: number;
    message: string;
    data?: any;
}