import { useState, useEffect } from "react";
import { C } from "./Shared";
import { call } from "../api";
import { EP } from "../config";
import {
  Card,
  Btn,
  Inp,
  Alrt,
  Spin,
  Av,
  Bdg,
  Hr,
  Tag,
  StatCard,
} from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";

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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pending, setPending] = useState<PendingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [method, setMethod] = useState("card");
  const [cardN, setCardN] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [cName, setCName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await call(EP.PAYMENT_INTENT.replace("/create-intent", ""));
        const list = r.data?.payments || r.data || r.payments || [];
        setPayments(list);

        // find first unpaid appointment
        const unpaid = list.find((p: Payment) => p.status === "pending");
        if (unpaid) setPending(unpaid);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "completed" || p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pay = async () => {
    if (!pending) return;
    setProcessing(true);
    setErr("");
    const body = {
      patientId: user.id,
      doctorId: pending.doctorId,
      appointmentId: pending.id,
      amount: pending.consultationFee || 0,
      currency: "NGN",
      paymentMethod: method,
    };
    try {
      await call(EP.PAYMENT_INTENT, "POST", body);
      setProcessing(false);
      setModal(false);
      setOk("✅ Payment successful! Appointment confirmed.");
      // refresh
      setPending(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Payment failed");
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
          <Tag method="POST" path="/api/v1/payments/create-intent" />
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
              No transactions yet. Book an appointment to get started.
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

        {pending && (
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
        )}

        {!pending && !loading && (
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
      {modal && pending && (
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
                onClick={() => setModal(false)}
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

            <Tag method="POST" path="/api/v1/payments/create-intent" />
            <Hr />

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { v: "card", l: "💳 Card" },
                { v: "transfer", l: "🏦 Transfer" },
                { v: "wallet", l: "👛 Wallet" },
              ].map((m) => (
                <button
                  key={m.v}
                  onClick={() => setMethod(m.v)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: 8,
                    border: `1.5px solid ${method === m.v ? C.p : C.b}`,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: method === m.v ? 700 : 400,
                    color: method === m.v ? C.p : C.m,
                    background: method === m.v ? C.pl : C.s,
                    fontFamily: "inherit",
                  }}
                >
                  {m.l}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Inp
                  label="cardName"
                  value={cName}
                  onChange={setCName}
                  placeholder="John Doe"
                />
                <Inp
                  label="cardNumber"
                  value={cardN}
                  onChange={(v) =>
                    setCardN(
                      v
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  placeholder="0000 0000 0000 0000"
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Inp
                    label="expiryDate"
                    value={exp}
                    onChange={(v) =>
                      setExp(
                        v
                          .replace(/\D/g, "")
                          .slice(0, 4)
                          .replace(/(.{2})/, "$1/"),
                      )
                    }
                    placeholder="MM/YY"
                  />
                  <Inp
                    label="cvv"
                    type="password"
                    value={cvv}
                    onChange={(v) => setCvv(v.slice(0, 3))}
                    placeholder="•••"
                  />
                </div>
              </div>
            )}

            {method === "transfer" && (
              <Card style={{ background: C.bg }}>
                {[
                  ["Bank", "GTBank"],
                  ["accountName", "HealthBridge Ltd"],
                  ["accountNumber", "0123456789"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      fontSize: 13,
                      borderBottom: `1px solid ${C.b}`,
                    }}
                  >
                    <span
                      style={{
                        color: C.m,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {k}
                    </span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </Card>
            )}

            {err && <Alrt>{err}</Alrt>}

            <div style={{ marginTop: 14 }}>
              <Btn
                full
                sz="lg"
                onClick={pay}
                disabled={
                  processing ||
                  (method === "card" && (!cardN || !exp || !cvv || !cName))
                }
              >
                {processing ? (
                  <Spin />
                ) : (
                  `Pay ₦${Number(pending.consultationFee || 0).toLocaleString()}`
                )}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
