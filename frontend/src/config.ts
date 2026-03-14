// ════════════════════════════════════════════════════════════════════════════
// SERVICE CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════
export const GATEWAY =
  import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080";

export const EP = {
  // ── Auth Service (via gateway)
  AUTH_REGISTER: `${GATEWAY}/api/v1/auth/users/register`,
  AUTH_LOGIN: `${GATEWAY}/api/v1/auth/users/login`,
  AUTH_GET: (id: string) => `${GATEWAY}/api/v1/auth/users/${id}`,
  AUTH_DELETE: (id: string) => `${GATEWAY}/api/v1/auth/users/delete/${id}`,
  AUTH_FORGOT: `${GATEWAY}/api/v1/auth/users/forgot-password`,
  AUTH_RESET: `${GATEWAY}/api/v1/auth/users/reset-password`,
  AUTH_VERIFY: `${GATEWAY}/api/v1/auth/users/verify-email`,
  AUTH_INIT_VERIFY: `${GATEWAY}/api/v1/auth/users/initiate-email-verification`,

  // ── Profile Service (via gateway)
  PROFILE_PATIENT: `${GATEWAY}/api/v1/profiles/patients/profile`,
  PROFILE_DOCTOR: `${GATEWAY}/api/v1/profiles/doctors/profile`,
  PROFILE_PHARMACY: `${GATEWAY}/api/v1/profiles/pharmacies/profile`,
  PROFILE_GET_PATIENT: `${GATEWAY}/api/v1/profiles/patients/profile`,
  PROFILE_GET_DOCTOR: `${GATEWAY}/api/v1/profiles/doctors/profile`,
  PROFILE_GET_PHARMACY: `${GATEWAY}/api/v1/profiles/pharmacies/profile`,
  PROFILE_GET_PATIENT_BY_ID: (id: string) =>
    `${GATEWAY}/api/v1/profiles/patients/${id}`,
  PROFILE_GET_DOCTOR_BY_ID: (id: string) =>
    `${GATEWAY}/api/v1/profiles/doctors/${id}`,
  DOCTORS_SEARCH: `${GATEWAY}/api/v1/profiles/doctors/search`,
  DOCTOR_PAYMENT_DATA: (id: string) =>
    `${GATEWAY}/api/v1/profiles/doctors/${id}/payment`,
  DOCTOR_APPOINTMENTS: `${GATEWAY}/api/v1/profiles/doctors/payment`,

  // ── Payment Service (via gateway)
  PAYMENT_INITIATE: `${GATEWAY}/api/v1/payments/initiate`,
  PAYMENT_WEBHOOK: `${GATEWAY}/api/v1/payments/webhooks/paystack`,
  PAYMENT_VERIFY: `${GATEWAY}/api/v1/payments/verify`,

  // ── Drug Service (via gateway)
  DRUG_CREATE: `${GATEWAY}/api/v1/drugs/create`,
  DRUG_SEARCH: `${GATEWAY}/api/v1/drugs/search`,
  RX_CREATE: `${GATEWAY}/api/v1/pharm/prescription/create`,
  RX_VIEW: `${GATEWAY}/api/v1/prescription/view`,

  // ── Notification Service (via gateway)
  NOTIFICATIONS: (userId: string) =>
    `${GATEWAY}/api/v1/notifications/${userId}`,
  NOTIFICATIONS_COUNT: (userId: string) =>
    `${GATEWAY}/api/v1/notifications/${userId}/count`,
  // ── AI Service (via gateway)
  AI_CHAT: `${GATEWAY}/api/v1/ai/chat`,
  AI_SYMPTOM: `${GATEWAY}/api/v1/ai/symptom-check`,
  AI_RECOMMEND: `${GATEWAY}/api/v1/ai/recommend-doctor`,
  AI_PHARM_MATCH: `${GATEWAY}/api/v1/ai/pharmacy-match`,

  // ── Pharmacy search (via gateway)
  PHARM_NEARBY: `${GATEWAY}/api/v1/profiles/pharmacies/nearby`,
  PHARM_SEARCH: `${GATEWAY}/api/v1/profiles/pharmacies/search`,
};
