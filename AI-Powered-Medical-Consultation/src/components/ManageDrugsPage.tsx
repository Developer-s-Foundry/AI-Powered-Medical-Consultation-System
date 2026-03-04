import { useState, useEffect } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Inp, Alrt, Spin, Bdg, Tbl } from "./Shared";

export const ManageDrugsPage = () => {
  const [drugs, setDrugs] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [f, setF] = useState({
    medicineName: "",
    dosage: "",
    manufacturer: "",
    quantity: "",
    price: "",
    expiryDate: "",
    description: "",
    requiresPrescription: true,
  });

  const emptyForm = {
    medicineName: "",
    dosage: "",
    manufacturer: "",
    quantity: "",
    price: "",
    expiryDate: "",
    description: "",
    requiresPrescription: true,
  };

  useEffect(() => {
    call(`${EP.DRUG_SEARCH}?medicineName=`)
      .then((r) => setDrugs(r.data?.drugs || r.drugs || []))
      .catch(() => setDrugs([]));
  }, []);

  const addDrug = async () => {
    setSaving(true);
    setErr("");
    const body = {
      ...f,
      quantity: parseInt(f.quantity) || 0,
      price: parseFloat(f.price) || 0,
    };
    try {
      const res = await call(EP.DRUG_CREATE, "POST", body);
      setDrugs((p: any) => [res.data || res, ...p]);
      setShowForm(false);
      setOk("Drug added!");
      setF(emptyForm);
    } catch (e: any) {
      setErr(e.message);
    }
    setSaving(false);
  };

  const search = async () => {
    try {
      const r = await call(`${EP.DRUG_SEARCH}?medicineName=${q}`);
      setDrugs(r.data?.drugs || r.drugs || []);
    } catch {}
  };

  const clearSearch = async () => {
    setQ("");
    try {
      const r = await call(`${EP.DRUG_SEARCH}?medicineName=`);
      setDrugs(r.data?.drugs || r.drugs || []);
    } catch {}
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
            Drug Inventory
          </h1>
        </div>
        <Btn onClick={() => setShowForm(!showForm)}>+ Add Drug</Btn>
      </div>

      {ok && <Alrt type="success">{ok}</Alrt>}
      {err && <Alrt>{err}</Alrt>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Inp
              label="medicineName"
              value={q}
              onChange={setQ}
              placeholder="Search by name…"
            />
          </div>
          <Btn onClick={search}>Search</Btn>
          <Btn v="ghost" onClick={clearSearch}>
            Clear
          </Btn>
        </div>
      </Card>

      {showForm && (
        <Card style={{ border: `1.5px solid ${C.p}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Add Drug — POST /api/v1/drugs/create
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {(
              [
                "medicineName",
                "dosage",
                "manufacturer",
                "quantity",
                "price",
              ] as const
            ).map((k) => (
              <Inp
                key={k}
                label={k}
                value={f[k] as string}
                onChange={(v) => setF((p) => ({ ...p, [k]: v }))}
                placeholder={k}
              />
            ))}
            <Inp
              label="expiryDate"
              type="date"
              value={f.expiryDate}
              onChange={(v) => setF((p) => ({ ...p, expiryDate: v }))}
            />
            <div style={{ gridColumn: "1/-1" }}>
              <Inp
                label="description"
                value={f.description}
                onChange={(v) => setF((p) => ({ ...p, description: v }))}
                placeholder="Brief drug description"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}
            >
              requiresPrescription
            </span>
            <button
              onClick={() =>
                setF((p) => ({
                  ...p,
                  requiresPrescription: !p.requiresPrescription,
                }))
              }
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                border: `1.5px solid ${f.requiresPrescription ? C.p : C.b}`,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: f.requiresPrescription ? C.p : C.m,
                background: f.requiresPrescription ? C.pl : C.s,
                fontFamily: "inherit",
              }}
            >
              {String(f.requiresPrescription)}
            </button>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn
              onClick={addDrug}
              disabled={saving || !f.medicineName || !f.dosage}
            >
              {saving ? <Spin /> : "Add Drug"}
            </Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <Card>
        {drugs.length === 0 && (
          <div style={{ color: C.m, fontSize: 13, padding: 12 }}>
            No drugs found.
          </div>
        )}
        <Tbl
          cols={[
            {
              k: "medicineName",
              r: (r: any) => <strong>{r.medicineName}</strong>,
            },
            { k: "dosage" },
            { k: "manufacturer" },
            {
              k: "quantity",
              r: (r: any) => (
                <span style={{ color: r.quantity < 50 ? C.d : C.t }}>
                  {r.quantity}
                </span>
              ),
            },
            {
              k: "price",
              r: (r: any) => `₦${Number(r.price).toLocaleString()}`,
            },
            {
              k: "expiryDate",
              r: (r: any) => new Date(r.expiryDate).toLocaleDateString(),
            },
            {
              k: "requiresPrescription",
              r: (r: any) => (
                <Bdg
                  c={r.requiresPrescription ? C.pu : C.g}
                  bg={r.requiresPrescription ? C.pul : C.gl}
                >
                  {String(r.requiresPrescription)}
                </Bdg>
              ),
            },
          ]}
          rows={drugs}
        />
      </Card>
    </div>
  );
};
