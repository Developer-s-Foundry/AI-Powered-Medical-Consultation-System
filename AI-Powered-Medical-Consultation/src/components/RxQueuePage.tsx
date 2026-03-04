import { useState, useEffect } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn } from "./Shared";
import { SBdg } from "./Shared";

export const RxQueuePage = () => {
  const [rxs, setRxs] = useState(MOCK_DB.prescriptions);
  const drugMap = Object.fromEntries(MOCK_DB.drugs.map((d) => [d.id, d]));

  useEffect(() => {
    if (!USE_MOCK)
      call(EP.RX_VIEW)
        .then((r) => setRxs(r.data || r.prescriptions || []))
        .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          Prescription Queue
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rxs.map((rx: any) => (
          <Card key={rx.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div>
                <strong style={{ fontSize: 13 }}>Rx #{rx.id}</strong>
                <div
                  style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
                >
                  patientId: {rx.patientId?.slice(0, 16)}…
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {SBdg(rx.status)}
                <Btn
                  sz="xs"
                  style={{ background: C.gl, color: C.g, border: "none" }}
                >
                  Dispense
                </Btn>
              </div>
            </div>

            <div
              style={{
                background: C.bg,
                padding: "8px 12px",
                borderRadius: 8,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span
                style={{ fontFamily: "monospace", fontSize: 11, color: C.m }}
              >
                diagnosis:{" "}
              </span>
              <strong>{rx.diagnosis}</strong>
            </div>

            {rx.items.map((item: any) => {
              const drug = drugMap[item.drugId];
              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 8,
                    padding: "8px 12px",
                    background: C.pl,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                >
                  <strong>
                    {drug?.medicineName} {drug?.dosage}
                  </strong>
                  <span style={{ color: C.m }}>dosage: {item.dosage}</span>
                  <span style={{ color: C.m }}>duration: {item.duration}</span>
                  <span style={{ color: C.m }}>
                    qty: {item.quantityPrescribed}
                  </span>
                </div>
              );
            })}
          </Card>
        ))}
      </div>
    </div>
  );
};
