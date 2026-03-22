"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientType = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["PAYMENT_SUCCESS"] = "payment_success";
    EventType["PAYMENT_FAILED"] = "payment_failed";
    EventType["CREATE_APPOINTMENT"] = "create_appointment";
})(EventType || (exports.EventType = EventType = {}));
var RecipientType;
(function (RecipientType) {
    RecipientType["patient"] = "patient";
    RecipientType["doctor"] = "doctor";
})(RecipientType || (exports.RecipientType = RecipientType = {}));
