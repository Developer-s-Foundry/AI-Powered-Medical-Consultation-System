/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PaymentController } from './../controller/payment.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "PaymentType": {
        "dataType": "refObject",
        "properties": {
            "doctor_id": {"dataType":"string","required":true},
            "patient_id": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "provider_name": {"dataType":"string","required":true},
            "patient_email": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "payment_status": {
        "dataType": "refEnum",
        "enums": ["pending","completed","failed","refunded"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Payment": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "appointment_id": {"dataType":"string","required":true},
            "patient_id": {"dataType":"string","required":true},
            "patient_email": {"dataType":"string","required":true},
            "payment_reference_id": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "currency": {"dataType":"string","required":true},
            "status": {"ref":"payment_status","required":true},
            "idempotency_key": {"dataType":"string","required":true},
            "retry_count": {"dataType":"double","required":true},
            "last_retry_at": {"dataType":"datetime","required":true},
            "next_retry": {"dataType":"double","required":true},
            "provider": {"ref":"Provider","required":true},
            "transactions": {"dataType":"array","array":{"dataType":"refObject","ref":"Transaction"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Provider": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "provider_name": {"dataType":"string","required":true},
            "is_active": {"dataType":"boolean","required":true},
            "payments": {"dataType":"array","array":{"dataType":"refObject","ref":"Payment"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Transaction": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "payment_reference_id": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "status": {"dataType":"string","required":true},
            "response_payload": {"dataType":"any","required":true},
            "payment": {"ref":"Payment","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsPaymentController_createPayment: Record<string, TsoaRoute.ParameterSchema> = {
                paymentData: {"in":"body","name":"paymentData","required":true,"ref":"PaymentType"},
        };
        app.post('/payments/initiate',
            ...(fetchMiddlewares<RequestHandler>(PaymentController)),
            ...(fetchMiddlewares<RequestHandler>(PaymentController.prototype.createPayment)),

            async function PaymentController_createPayment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_createPayment, request, response });

                const controller = new PaymentController();

              await templateService.apiHandler({
                methodName: 'createPayment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPaymentController_verifyPayment: Record<string, TsoaRoute.ParameterSchema> = {
                reference: {"in":"path","name":"reference","required":true,"dataType":"string"},
        };
        app.post('/payments/verify/:reference',
            ...(fetchMiddlewares<RequestHandler>(PaymentController)),
            ...(fetchMiddlewares<RequestHandler>(PaymentController.prototype.verifyPayment)),

            async function PaymentController_verifyPayment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_verifyPayment, request, response });

                const controller = new PaymentController();

              await templateService.apiHandler({
                methodName: 'verifyPayment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPaymentController_getPaymentById: Record<string, TsoaRoute.ParameterSchema> = {
                paymentId: {"in":"path","name":"paymentId","required":true,"dataType":"string"},
        };
        app.get('/payments/:paymentId',
            ...(fetchMiddlewares<RequestHandler>(PaymentController)),
            ...(fetchMiddlewares<RequestHandler>(PaymentController.prototype.getPaymentById)),

            async function PaymentController_getPaymentById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_getPaymentById, request, response });

                const controller = new PaymentController();

              await templateService.apiHandler({
                methodName: 'getPaymentById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPaymentController_handlePaystackWebhook: Record<string, TsoaRoute.ParameterSchema> = {
                signature: {"in":"header","name":"x-paystack-signature","required":true,"dataType":"string"},
                webhookData: {"in":"body","name":"webhookData","required":true,"dataType":"any"},
        };
        app.post('/payments/webhook/paystack',
            ...(fetchMiddlewares<RequestHandler>(PaymentController)),
            ...(fetchMiddlewares<RequestHandler>(PaymentController.prototype.handlePaystackWebhook)),

            async function PaymentController_handlePaystackWebhook(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_handlePaystackWebhook, request, response });

                const controller = new PaymentController();

              await templateService.apiHandler({
                methodName: 'handlePaystackWebhook',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
