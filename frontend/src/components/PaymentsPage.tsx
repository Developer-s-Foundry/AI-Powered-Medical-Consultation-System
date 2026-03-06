import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { call } from "../api";
import { EP } from "../config";
import { MOCK_DB } from "./MockData";
import PaystackPop from '@paystack/inline-js'
import {
  Card,
  Btn,
  Alrt,
  Spin,
  Av,
  Bdg,
  Hr,
  Tag,
  Tbl,
  StatCard,
} from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";
import { useDoctorContext } from "./DoctorProvider";

type PaymentsPageProps = {
  user: AuthUser;
};

export const PaymentsPage = ({ user }: PaymentsPageProps) => {
  const [modal, setModal] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [processing, setProcessing] = useState(false)
  const docMap = Object.fromEntries(MOCK_DB.doctors.map((d) => [d.id, d]));
  const selApt = MOCK_DB.appointments[0];
  const selDoc = docMap[selApt?.doctorId]; //th
  const {doctor} = useDoctorContext();
  const navigate = useNavigate()

// get all the doctors that have been booked successfully by a patient in the past

// get all the payments related to patient
// get the current amount patient is to pay
// get the total sum of all their payment
// handle the success page
// set up my paystack profile completely to enable live payment
// update appointment table
// test the payment service
// research 


  const pay = async () => {
    setProcessing(true);
    setErr("");

    const body = {
      patientId: user.id,
      doctor_id: doctor?.doctor_id,
    amount: doctor?.fee,
    provider_name: 'paystack',
    }

  try {
      // 1. Call backend to initialise transaction with Paystack
      const res = await call(EP.PAYMENT_INITIATE, "POST", {
          body
      });

      if (!res.success) {
        setErr("Failed to initiate payment")

      }

      const { access_code} = res;

      // 2. Open Paystack popup using access_code from backend
      const popup = new PaystackPop();

      popup.resumeTransaction(access_code, {

        // 3. Payment was successful
        onSuccess: async (transaction: { reference: string }) => {
          try {
            // 4. Verify on backend — never trust frontend alone
            const verification = await call(
              `${EP.PAYMENT_VERIFY}/${transaction.reference}`,
              "POST",
              {}
            );

            if (verification.success) {
              setModal(false);
              setOk("✅ Payment successful! Appointment confirmed.");

              // 5. Redirect to success page after short delay
              setTimeout(() => {
                navigate("/payment/success", {
                  state: {
                    reference: transaction.reference,
                    amount: selDoc?.consultationFee || 25000,
                    doctor: {
                      name: `Dr. ${selDoc?.firstName} ${selDoc?.lastName}`,
                      specialty: selDoc?.specialty || "General Practice",
                    },
                    appointment: {
                      date: selApt?.date,
                      time: selApt?.time,
                      id: selApt?.id,
                    },
                    paidAt: new Date().toISOString(),
                  },
                });
              }, 1500);
            } else {
              setErr("Payment verification failed. Please contact support.");
            }
          } catch {
            setErr("Could not verify payment. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },

        // Payment was cancelled by patient
        onCancel: () => {
          setProcessing(false);
          setErr("Payment was cancelled.");
        },
      });

    } catch (e: any) {
      setErr(e.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          Payments
        </h1>
        <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
          <Tag method="POST" path="/api/v1/payment/initiate-payment" />
          <Tag method="POST" path="/api/v1/webhooks/paystack" />
        </div>
      </div>

      {ok && <Alrt type="success">{ok}</Alrt>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="💳"
          label="totalPaid" 
          value="₦40,000" // total amount paid by patient
          c={C.g}
          bg={C.gl}
        />
        <StatCard icon="⏳" label="pending" 
        value="₦15,000" // amount being paid but pending
        c={C.w} bg={C.wl} />
        <StatCard
          icon="📋"
          label="transactions" 
          value={MOCK_DB.payments.length} // total transaction made by customer
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
      >
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Transaction History
          </div>
          <Tbl
            cols={[
              {
                k: "doctorId",
                r: (r) => {
                  const d = docMap[r.doctorId];
                  return d ? `Dr. ${d.firstName} ${d.lastName}` : "—";
                },
              },
              {
                k: "amount",
                r: (r) => (
                  <span style={{ fontWeight: 700, color: C.g }}>
                    ₦{r.amount.toLocaleString()}
                  </span>
                ),
              },
              { k: "method", r: (r) => <Bdg>{r.method}</Bdg> },
              { k: "createdAt" },
              { k: "status", r: (r) => SBdg(r.status) },
            ]}
            rows={MOCK_DB.payments}
          />
        </Card>

        {selDoc && (
          <Card>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
              Pending Payment
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Av name={`${selDoc.firstName} ${selDoc.lastName}`} size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Dr. {selDoc.firstName} {selDoc.lastName}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>
                  {selApt.date} · {selApt.time}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              <span style={{ color: C.m }}>consultationFee</span>
              <strong>₦{selDoc.consultationFee.toLocaleString()}</strong>
            </div>
            <Btn full onClick={() => setModal(true)}>
              Pay Now
            </Btn>
          </Card>
        )}

         {/* Payment Modal */}
      {modal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
        }}>
          <Card style={{ width: 420 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}>
              <strong style={{ fontSize: 15 }}>Complete Payment</strong>
              <button
                onClick={() => { setModal(false); setErr(""); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: C.m,
                }}
              >
                ×
              </button>
            </div>

            <Tag method="POST" path="/api/v1/payment/initiate-payment" />
            <Hr />

            {/* Summary */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <Av name={`${selDoc.firstName} ${selDoc.lastName}`} size={40} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Dr. {selDoc.firstName} {selDoc.lastName}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>
                  {selApt.date} · {selApt.time}
                </div>
              </div>
            </div>

            <div style={{
              background: C.bg,
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}>
              <span style={{ color: C.m }}>Consultation Fee</span>
              <strong style={{ color: C.g }}>
                ₦{(selDoc?.consultationFee || 25000).toLocaleString()}
              </strong>
            </div>

            <div style={{ fontSize: 12, color: C.m, marginBottom: 16, textAlign: "center" }}>
              🔒 Secured by Paystack. You will be redirected to complete payment.
            </div>

            {err && <Alrt>{err}</Alrt>}

            <Btn
              full
              sz="lg"
              onClick={pay}
              disabled={processing}
            >
              {processing ? <Spin /> : `Pay ₦${(selDoc?.consultationFee || 25000).toLocaleString()}`}
            </Btn>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};
