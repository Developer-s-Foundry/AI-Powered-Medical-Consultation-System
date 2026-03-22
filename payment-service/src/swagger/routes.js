"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const payment_controller_1 = require("./../controller/payment.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "PaymentType": {
        "dataType": "refObject",
        "properties": {
            "doctor_id": { "dataType": "string", "required": true },
            "patient_id": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "provider_name": { "dataType": "string", "required": true },
            "patient_email": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "payment_status": {
        "dataType": "refEnum",
        "enums": ["pending", "completed", "failed", "refunded"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Payment": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "appointment_id": { "dataType": "string", "required": true },
            "patient_id": { "dataType": "string", "required": true },
            "patient_email": { "dataType": "string", "required": true },
            "payment_reference_id": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "currency": { "dataType": "string", "required": true },
            "status": { "ref": "payment_status", "required": true },
            "idempotency_key": { "dataType": "string", "required": true },
            "retry_count": { "dataType": "double", "required": true },
            "last_retry_at": { "dataType": "datetime", "required": true },
            "next_retry": { "dataType": "double", "required": true },
            "provider": { "ref": "Provider", "required": true },
            "transactions": { "dataType": "array", "array": { "dataType": "refObject", "ref": "Transaction" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Provider": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "provider_name": { "dataType": "string", "required": true },
            "is_active": { "dataType": "boolean", "required": true },
            "payments": { "dataType": "array", "array": { "dataType": "refObject", "ref": "Payment" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Transaction": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
            "payment_reference_id": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "status": { "dataType": "string", "required": true },
            "response_payload": { "dataType": "any", "required": true },
            "payment": { "ref": "Payment", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsPaymentController_createPayment = {
        paymentData: { "in": "body", "name": "paymentData", "required": true, "ref": "PaymentType" },
    };
    app.post('/payments/initiate', ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController)), ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController.prototype.createPayment)), function PaymentController_createPayment(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_createPayment, request, response });
                const controller = new payment_controller_1.PaymentController();
                yield templateService.apiHandler({
                    methodName: 'createPayment',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPaymentController_verifyPayment = {
        reference: { "in": "path", "name": "reference", "required": true, "dataType": "string" },
    };
    app.post('/payments/verify/:reference', ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController)), ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController.prototype.verifyPayment)), function PaymentController_verifyPayment(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_verifyPayment, request, response });
                const controller = new payment_controller_1.PaymentController();
                yield templateService.apiHandler({
                    methodName: 'verifyPayment',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPaymentController_getPaymentById = {
        paymentId: { "in": "path", "name": "paymentId", "required": true, "dataType": "string" },
    };
    app.get('/payments/:paymentId', ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController)), ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController.prototype.getPaymentById)), function PaymentController_getPaymentById(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_getPaymentById, request, response });
                const controller = new payment_controller_1.PaymentController();
                yield templateService.apiHandler({
                    methodName: 'getPaymentById',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPaymentController_handlePaystackWebhook = {
        signature: { "in": "header", "name": "x-paystack-signature", "required": true, "dataType": "string" },
        webhookData: { "in": "body", "name": "webhookData", "required": true, "dataType": "any" },
    };
    app.post('/payments/webhook/paystack', ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController)), ...((0, runtime_1.fetchMiddlewares)(payment_controller_1.PaymentController.prototype.handlePaystackWebhook)), function PaymentController_handlePaystackWebhook(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            let validatedArgs = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPaymentController_handlePaystackWebhook, request, response });
                const controller = new payment_controller_1.PaymentController();
                yield templateService.apiHandler({
                    methodName: 'handlePaystackWebhook',
                    controller,
                    response,
                    next,
                    validatedArgs,
                    successStatus: undefined,
                });
            }
            catch (err) {
                return next(err);
            }
        });
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
