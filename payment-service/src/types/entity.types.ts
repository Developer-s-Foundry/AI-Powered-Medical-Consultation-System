export interface ResponseData {
    statusCode: number;
    message: string;
    data?: any;
}

export interface PaymentType {
    booking_id: string;
    user_id: string;
    amount: number;
    provider_name: string;
    email: string;
}