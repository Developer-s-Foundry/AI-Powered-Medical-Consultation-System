import { useState } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
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
  Tbl,
  StatCard,
} from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";

type PaymentsPageProps = {
  user: AuthUser;
};

export const PaymentsPage = ({ user }: PaymentsPageProps) => {
  const [modal, setModal] = useState(false);
  const [method, setMethod] = useState("card");
  const [cardN, setCardN] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [cName, setCName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const docMap = Object.fromEntries(MOCK_DB.doctors.map((d) => [d.id, d]));
  const selApt = MOCK_DB.appointments[0];
  const selDoc = docMap[selApt?.doctorId];

  const pay = async () => {
    setProcessing(true);
    setErr("");
    const body = {
      patientId: user.id,
      doctorId: selApt.doctorId,
      appointmentId: selApt.id,
      amount: selDoc?.consultationFee || 25000,
      currency: "NGN",
      paymentMethod: method,
    };
    try {
      if (!USE_MOCK) await call(EP.PAYMENT_INTENT, "POST", body);
      setTimeout(() => {
        setProcessing(false);
        setModal(false);
        setOk("✅ Payment successful! Appointment confirmed.");
      }, 1500);
    } catch (e: any) {
      setErr(e.message);
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
          <Tag method="POST" path="/api/v1/payment/create-intent" />
          <Tag method="POST" path="/api/v1/webhooks/stripe" />
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
          value="₦40,000"
          c={C.g}
          bg={C.gl}
        />
        <StatCard icon="⏳" label="pending" value="₦15,000" c={C.w} bg={C.wl} />
        <StatCard
          icon="📋"
          label="transactions"
          value={MOCK_DB.payments.length}
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
                k: "doctor",
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

            <Tag method="POST" path="/api/v1/payment/create-intent" />
            <Hr />

            {/* Method selector */}
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
                  `Pay ₦${(selDoc?.consultationFee || 25000).toLocaleString()}`
                )}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
