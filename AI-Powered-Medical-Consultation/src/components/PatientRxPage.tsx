import { useState, useEffect } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Av, Tag } from "./Shared";
import { SBdg } from "./Shared";

export const PatientRxPage = () => {
  const [rxs, setRxs] = useState([]);

  useEffect(() => {
    call(EP.RX_VIEW)
      .then((r) => {
        console.log("RX RESPONSE:", JSON.stringify(r, null, 2));
        setRxs(r.data?.prescriptions || r.prescriptions || []);
      })
      .catch(() => setRxs([]));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          My Prescriptions
        </h1>
        <div style={{ marginTop: 4 }}>
          <Tag method="GET" path="/api/v1/drugs/prescription/view" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rxs.length === 0 && (
          <div style={{ color: C.m, fontSize: 13 }}>
            No prescriptions found.
          </div>
        )}
        {rxs.map((rx: any) => (
          <Card key={rx.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Av name={rx.doctorName || "Doctor"} size={38} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    Dr. {rx.doctorName || rx.doctorId}
                  </div>
                  <div style={{ fontSize: 12, color: C.m }}>
                    {rx.specialty} ·{" "}
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {SBdg(rx.status)}
            </div>

            <div
              style={{
                background: C.bg,
                padding: "8px 12px",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
              >
                diagnosis:{" "}
              </span>
              <strong style={{ fontSize: 14 }}>{rx.diagnosis}</strong>
              {rx.instructions && (
                <div style={{ fontSize: 12, color: C.m, marginTop: 2 }}>
                  {rx.instructions}
                </div>
              )}
            </div>

            {rx.items?.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: C.pl,
                  borderRadius: 8,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <strong>
                  {item.medicineName || item.drugId} {item.dosage}
                </strong>
                <span style={{ color: C.m }}>
                  {item.dosage} · {item.duration} · qty:{" "}
                  {item.quantityPrescribed}
                </span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
};
