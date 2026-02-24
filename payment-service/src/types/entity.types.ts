export interface ResponseData {
    statusCode: number;
    message: string;
    data?: any;
}

export interface PaymentType {
    booking_id: string;
    patient_id: string;
    amount: number;
    provider_name: string;
    patient_email: string;
}

export interface DoctorsPaymentData {
    business_name: string;
    bank_code: string;
    account_number: string;
}