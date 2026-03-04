import { useState, useEffect } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Inp, Inp as InpField, Alrt, Spin, Tbl } from "./Shared";
import { SBdg } from "./Shared";

type Drug = {
  id: string;
  medicineName: string;
  dosage: string;
};

type RxItem = {
  id?: string;
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
  createdAt: string;
  items?: RxItem[];
};

const emptyForm = {
  patientId: "",
  appointmentId: "",
  diagnosis: "",
  instructions: "",
  notes: "",
  drugId: "",
  dosage: "",
  duration: "",
  quantityPrescribed: "",
};

export const DoctorRxPage = () => {
  const [rxs, setRxs] = useState<Rx[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [f, setF] = useState(emptyForm);

  // Fetch existing prescriptions and available drugs on mount
  useEffect(() => {
    call(EP.RX_VIEW)
      .then((r) =>
        setRxs(r.data?.prescriptions || r.prescriptions || r.data || []),
      )
      .catch(() => setRxs([]));

    call(`${EP.DRUG_SEARCH}?medicineName=`)
      .then((r) => setDrugs(r.data?.drugs || r.drugs || []))
      .catch(() => setDrugs([]));
  }, []);

  const drugMap = Object.fromEntries(drugs.map((d) => [d.id, d]));

  const save = async () => {
    setSaving(true);
    setErr("");
    const body = {
      patientId: f.patientId,
      appointmentId: f.appointmentId,
      diagnosis: f.diagnosis,
      instructions: f.instructions,
      notes: f.notes,
      items: [
        {
          drugId: f.drugId,
          dosage: f.dosage,
          duration: f.duration,
          quantityPrescribed: parseInt(f.quantityPrescribed) || 1,
        },
      ],
    };
    try {
      const res = await call(EP.RX_CREATE, "POST", body);
      setRxs((p) => [res.data || res, ...p]);
      setShowForm(false);
      setOk("Prescription issued!");
      setF(emptyForm);
    } catch (e: any) {
      setErr(e.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
            Prescriptions
          </h1>
        </div>
        <Btn onClick={() => setShowForm(!showForm)}>+ New Prescription</Btn>
      </div>

      {ok && <Alrt type="success">{ok}</Alrt>}
      {err && <Alrt>{err}</Alrt>}

      {showForm && (
        <Card style={{ border: `1.5px solid ${C.p}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Issue Prescription
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {(
              [
                "patientId",
                "appointmentId",
                "diagnosis",
                "instructions",
                "notes",
              ] as const
            ).map((k) => (
              <InpField
                key={k}
                label={k}
                value={f[k]}
                onChange={(v) => setF((p) => ({ ...p, [k]: v }))}
                placeholder={k}
              />
            ))}
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.m,
              fontFamily: "monospace",
              marginBottom: 8,
            }}
          >
            PrescriptionItem
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {/* Drug selector — populated from real API */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.t,
                  fontFamily: "monospace",
                }}
              >
                drugId
              </label>
              <select
                value={f.drugId}
                onChange={(e) =>
                  setF((p) => ({ ...p, drugId: e.target.value }))
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${C.b}`,
                  fontSize: 14,
                  fontFamily: "inherit",
                  background: "#fff",
                  outline: "none",
                  color: C.t,
                }}
              >
                <option value="">Select drug…</option>
                {drugs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.medicineName} {d.dosage}
                  </option>
                ))}
              </select>
            </div>

            {(["dosage", "duration", "quantityPrescribed"] as const).map(
              (k) => (
                <InpField
                  key={k}
                  label={k}
                  value={f[k]}
                  onChange={(v) => setF((p) => ({ ...p, [k]: v }))}
                  placeholder={k}
                />
              ),
            )}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn
              onClick={save}
              disabled={saving || !f.patientId || !f.diagnosis || !f.drugId}
            >
              {saving ? <Spin /> : "Issue"}
            </Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <Card>
        <Tbl
          cols={[
            {
              k: "patientId",
              r: (r) => (
                <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                  {r.patientId?.slice(0, 12)}…
                </span>
              ),
            },
            { k: "diagnosis" },
            {
              k: "drug",
              r: (r) => {
                const d = drugMap[r.items?.[0]?.drugId];
                return d ? `${d.medicineName} ${d.dosage}` : "—";
              },
            },
            { k: "status", r: (r) => SBdg(r.status) },
            {
              k: "createdAt",
              r: (r) => new Date(r.createdAt).toLocaleDateString(),
            },
          ]}
          rows={rxs}
        />
      </Card>
    </div>
  );
};
