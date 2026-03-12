import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { call } from "../api";
import { EP } from "../config";
import PaystackPop from "@paystack/inline-js";
import { Card, Btn, Alrt, Spin, Av, Bdg, Hr, Tag, StatCard } from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";
import { useDoctorContext } from "./DoctorProvider";

type PaymentsPageProps = {
  user: AuthUser;
};

type Payment = {
  id: string;
  doctorId?: string;
  doctorName?: string;
  amount: number;
  method?: string;
  status?: string;
  createdAt?: string;
};

type PendingAppointment = {
  id: string;
  doctorId?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  consultationFee?: number;
};

export const PaymentsPage = ({ user }: PaymentsPageProps) => {
  const navigate = useNavigate();
  const { doctor } = useDoctorContext();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [pending, setPending] = useState<PendingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await call(
          `${EP.PAYMENT_INITIATE.replace("/create-intent", "")}?patientId=${user.id}`,
        );
        const list: Payment[] =
          res.data?.payments || res.data || res.payments || [];
        setPayments(list);
        const unpaid = list.find((p) => p.status === "pending");
        if (unpaid) setPending(unpaid);
      } catch {
        /* ignored */
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user.id]);

  const totalPaid = payments
    .filter((p) => p.status === "completed" || p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pay = async () => {
    setProcessing(true);
    setErr("");

    try {
      const res = await call(EP.PAYMENT_INITIATE, "POST", {
        patientId: user.id,
        doctor_id: doctor?.doctor_id,
        amount: doctor?.fee,
        provider_name: "paystack",
      });

      if (!res.success) {
        setErr("Failed to initiate payment");
        setProcessing(false);
        return;
      }

      const { access_code } = res;
      const popup = new PaystackPop();

      popup.resumeTransaction(access_code, {
        onSuccess: async (transaction: { reference: string }) => {
          try {
            const verification = await call(
              `${EP.PAYMENT_VERIFY}/${transaction.reference}`,
              "POST",
              {},
            );
            if (verification.success) {
              setModal(false);
              setOk("✅ Payment successful! Appointment confirmed.");
              setTimeout(() => {
                navigate("/payment/success", {
                  state: {
                    reference: transaction.reference,
                    amount: doctor?.fee,
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
        onCancel: () => {
          setProcessing(false);
          setErr("Payment was cancelled.");
        },
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
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
          value={`₦${totalPaid.toLocaleString()}`}
          c={C.g}
          bg={C.gl}
        />
        <StatCard
          icon="⏳"
          label="pending"
          value={`₦${totalPending.toLocaleString()}`}
          c={C.w}
          bg={C.wl}
        />
        <StatCard icon="📋" label="transactions" value={payments.length} />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
      >
        {/* Transaction History */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Transaction History
          </div>
          {loading && (
            <div style={{ fontSize: 13, color: C.m }}>
              Loading transactions…
            </div>
          )}
          {!loading && payments.length === 0 && (
            <div style={{ fontSize: 13, color: C.m, padding: 12 }}>
              No transactions yet.
            </div>
          )}
          {!loading && payments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {payments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: C.bg,
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {p.doctorName ? `Dr. ${p.doctorName}` : "Consultation"}
                    </div>
                    <div style={{ fontSize: 12, color: C.m }}>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontWeight: 700, color: C.g }}>
                      ₦{Number(p.amount).toLocaleString()}
                    </span>
                    {p.method && <Bdg>{p.method}</Bdg>}
                    {SBdg(p.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Payment */}
        {pending ? (
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
              <Av name={pending.doctorName || "Doctor"} size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {pending.doctorName
                    ? `Dr. ${pending.doctorName}`
                    : "Consultation"}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>
                  {pending.date} {pending.time ? `· ${pending.time}` : ""}
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
              <strong>
                ₦{Number(pending.consultationFee || 0).toLocaleString()}
              </strong>
            </div>
            <Btn full onClick={() => setModal(true)}>
              Pay Now
            </Btn>
          </Card>
        ) : (
          <Card>
            <div
              style={{
                fontSize: 13,
                color: C.m,
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No pending payments.
            </div>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <Card style={{ width: 420 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <strong style={{ fontSize: 15 }}>Complete Payment</strong>
              <button
                onClick={() => {
                  setModal(false);
                  setErr("");
                }}
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

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Av name={pending?.doctorName || "Doctor"} size={40} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {pending?.doctorName
                    ? `Dr. ${pending.doctorName}`
                    : "Consultation"}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>
                  {pending?.date} {pending?.time ? `· ${pending.time}` : ""}
                </div>
              </div>
            </div>

            <div
              style={{
                background: C.bg,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
              }}
            >
              <span style={{ color: C.m }}>Consultation Fee</span>
              <strong style={{ color: C.g }}>
                ₦{Number(pending?.consultationFee || 0).toLocaleString()}
              </strong>
            </div>

            <div
              style={{
                fontSize: 12,
                color: C.m,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              🔒 Secured by Paystack. You will be redirected to complete
              payment.
            </div>

            {err && <Alrt>{err}</Alrt>}

            <Btn full sz="lg" onClick={pay} disabled={processing}>
              {processing ? (
                <Spin />
              ) : (
                `Pay ₦${Number(pending?.consultationFee || 0).toLocaleString()}`
              )}
            </Btn>
          </Card>
        </div>
      )}
    </div>
  );
};
