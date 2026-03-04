import { useState, useEffect } from "react";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Bdg, StatCard, Tbl } from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";

type DoctorPaymentsPageProps = {
  user: AuthUser;
};

type PaymentData = {
  consultationFees?: Record<string, number>;
  totalEarned?: number;
  balance?: number;
  pending?: number;
  paystack?: {
    accountId?: string;
    accountStatus?: string;
    payoutsEnabled?: boolean;
    chargesEnabled?: boolean;
  };
};
export const DoctorPaymentsPage = ({ user }: DoctorPaymentsPageProps) => {
  const [pd, setPd] = useState<PaymentData | null>(null);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    call(EP.DOCTOR_PAYMENT_DATA(user.id))
      .then((r) => setPd(r.data || r))
      .catch(() => {});

    call(EP.DOCTOR_PAYMENTS(user.id))
      .then((r) => setPayments(r.data || r))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          Payments
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Balance card */}
        <Card p={20} style={{ background: C.p, border: "none" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>💰</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
            ₦{(pd?.balance || 0).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.7)",
              marginBottom: 12,
            }}
          >
            availableBalance
          </div>
          <Btn
            sz="sm"
            style={{ background: "#fff", color: C.p, border: "none" }}
            onClick={() => {}}
          >
            Withdraw
          </Btn>
        </Card>
        <StatCard
          icon="📈"
          label="totalEarned"
          value={`₦${(pd?.totalEarned || 0).toLocaleString()}`}
          c={C.g}
          bg={C.gl}
        />
        <StatCard
          icon="⏳"
          label="pending"
          value={`₦${(pd?.pending || 0).toLocaleString()}`}
          c={C.w}
          bg={C.wl}
        />
      </div>

      <Card>
        <Tbl
          cols={[
            {
              k: "patientId",
              r: (r) => (
                <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                  {(r.patientId as string)?.slice(0, 12)}…
                </span>
              ),
            },
            {
              k: "amount",
              r: (r) => (
                <span style={{ fontWeight: 700, color: C.g }}>
                  ₦{(r.amount as number)?.toLocaleString()}
                </span>
              ),
            },
            { k: "method", r: (r) => <Bdg>{r.method as string}</Bdg> },
            { k: "createdAt" },
            { k: "status", r: (r) => SBdg(r.status as string) },
          ]}
          rows={payments}
        />
      </Card>
    </div>
  );
};
