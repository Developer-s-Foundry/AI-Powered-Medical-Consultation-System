import { useState, useEffect } from "react";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Spin } from "./Shared";
import { SBdg } from "./Shared";

// Top of file — add these types
type DrugItem = {
  id: string;
  medicineName: string;
  dosage: string;
};

type RxItem = {
  id: string;
  drugId: string;
  dosage: string;
  duration: string;
  quantityPrescribed: number;
};

type Rx = {
  id: string;
  patientId: string;
  diagnosis: string;
  status: string;
  items: RxItem[];
};

export const RxQueuePage = () => {
  const [rxs, setRxs] = useState<Rx[]>([]);
  const [drugMap, setDrugMap] = useState<Record<string, DrugItem>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([call(EP.RX_VIEW), call(EP.DRUG_SEARCH)])
      .then(([rxRes, drugRes]) => {
        setRxs(rxRes.data || rxRes.prescriptions || []);
        const drugs: DrugItem[] = drugRes.data || drugRes.drugs || [];
        setDrugMap(Object.fromEntries(drugs.map((d) => [d.id, d])));
      })
      .catch(() => setErr("Failed to load prescriptions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          Prescription Queue
        </h1>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : err ? (
        <Card style={{ textAlign: "center", color: C.d }} p={32}>
          {err}
        </Card>
      ) : rxs.length === 0 ? (
        <Card style={{ textAlign: "center" }} p={40}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💊</div>
          <div style={{ fontWeight: 700, color: C.t }}>
            No prescriptions in queue
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rxs.map((rx) => (
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
                    style={{
                      fontSize: 11,
                      color: C.m,
                      fontFamily: "monospace",
                    }}
                  >
                    patientId: {rx.patientId?.slice(0, 16)}…
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {SBdg(rx.status)}
                  <Btn
                    sz="xs"
                    style={{ background: C.gl, color: C.g, border: "none" }}
                    onClick={() => {}}
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

              {rx.items?.map((item) => {
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
                    <span style={{ color: C.m }}>
                      duration: {item.duration}
                    </span>
                    <span style={{ color: C.m }}>
                      qty: {item.quantityPrescribed}
                    </span>
                  </div>
                );
              })}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
