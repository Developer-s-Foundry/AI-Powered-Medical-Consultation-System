import { useState, useEffect } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Inp, Sel, Alrt, Spin, Tag } from "./Shared";
import type { AuthUser } from "./Shared";

type ProfileSetupPageProps = {
  user: AuthUser;
  onComplete: (profile: any) => void;
};

const endpointMap = {
  patient: "/api/v1/profiles/patients/profile",
  doctor: "/api/v1/profiles/doctors/profile",
  pharmacy: "/api/v1/profiles/pharmacies/profile",
};

export const ProfileSetupPage = ({
  user,
  onComplete,
}: ProfileSetupPageProps) => {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [pf, setPf] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      coordinates: { lat: 0, lng: 0 },
    },
  });

  const [df, setDf] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    hospitalName: "",
    consultationFee: "",
  });

  const [phf, setPhf] = useState({
    pharmacyName: "",
    phone: "",
    licenseNumber: "",
    operatingHours: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      coordinates: { lat: 0, lng: 0 },
    },
  });

  // Auto-populate coordinates via geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("GEO SUCCESS:", coords.lat, coords.lng);
        setPf((p) => ({
          ...p,
          address: { ...p.address, coordinates: coords },
        }));
        setPhf((p) => ({
          ...p,
          address: { ...p.address, coordinates: coords },
        }));
      },
      (error) => console.warn("Geolocation failed:", error.message),
    );
  }, []);

  const save = async () => {
    console.log("user.role:", user.role);
    setSaving(true);
    setErr("");

    try {
      let body: any;
      let endpoint: string;

      if (user.role === "patient") {
        body = {
          firstName: pf.firstName,
          lastName: pf.lastName,
          phone: pf.phone,
          dateOfBirth: pf.dateOfBirth,
          gender: pf.gender,
          address: {
            street: pf.address.street,
            city: pf.address.city,
            state: pf.address.state,
            country: pf.address.country,
            coordinates: {
              lat: pf.address.coordinates.lat,
              lng: pf.address.coordinates.lng,
            },
          },
        };
        endpoint = EP.PROFILE_PATIENT;
      } else if (user.role === "doctor") {
        body = {
          firstName: df.firstName,
          lastName: df.lastName,
          phone: df.phone,
          gender: df.gender,
          specialty: df.specialty,
          hospitalName: df.hospitalName,
          yearsOfExperience: df.yearsOfExperience,
          consultationFee: df.consultationFee,
        };
        console.log("Doctor body:", JSON.stringify(body, null, 2));
        endpoint = EP.PROFILE_DOCTOR;
      } else {
        body = {
          pharmacyName: phf.pharmacyName,
          phone: phf.phone,
          lincenseNumber: phf.licenseNumber,
          address: {
            street: phf.address.street,
            city: phf.address.city,
            state: phf.address.state,
            country: phf.address.country,
            coordinates: {
              lat: phf.address.coordinates.lat,
              lng: phf.address.coordinates.lng,
            },
          },
        };
        console.log("PHARMACY BODY:", JSON.stringify(body, null, 2));
        endpoint = EP.PROFILE_PHARMACY;
      }

      console.log("FINAL BODY:", JSON.stringify(body, null, 2));
      const res = await call(endpoint, "POST", body);
      onComplete(res.data || res);
    } catch (e: any) {
      setErr(e.message);
    }
    setSaving(false);
  };

  const isValid =
    user.role === "patient"
      ? pf.firstName &&
        pf.lastName &&
        pf.address.street &&
        pf.address.city &&
        pf.address.state &&
        pf.address.country
      : user.role === "doctor"
        ? df.firstName && df.lastName && df.specialty && df.licenseNumber
        : phf.pharmacyName &&
          phf.phone &&
          phf.licenseNumber &&
          phf.address.street &&
          phf.address.city &&
          phf.address.state &&
          phf.address.country;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 620 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: C.p }}>
            HealthBridge
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              margin: "10px 0 4px",
              padding: "4px 14px",
              background: C.pl,
              borderRadius: 20,
            }}
          >
            <span style={{ fontSize: 12, color: C.p, fontWeight: 700 }}>
              Step 2 of 2 — Create Profile
            </span>
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 800, color: C.t, marginTop: 8 }}
          >
            {user.role === "patient"
              ? "🧑 Your Patient Profile"
              : user.role === "doctor"
                ? "🩺 Your Doctor Profile"
                : "🏪 Your Pharmacy Profile"}
          </div>
          <div style={{ fontSize: 13, color: C.m, marginTop: 4 }}>
            Welcome, <strong>{user.name}</strong>! Fill in your details to
            complete registration.
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Tag method="POST" path={endpointMap[user.role]} />
        </div>

        {err && <Alrt>{err}</Alrt>}

        {/* ── Patient Form ── */}
        {user.role === "patient" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Inp
              label="First Name"
              value={pf.firstName}
              onChange={(v) => setPf((p) => ({ ...p, firstName: v }))}
            />
            <Inp
              label="Last Name"
              value={pf.lastName}
              onChange={(v) => setPf((p) => ({ ...p, lastName: v }))}
            />
            <Inp
              label="Phone"
              value={pf.phone}
              onChange={(v) => setPf((p) => ({ ...p, phone: v }))}
              placeholder="+2348011111111"
            />
            <Inp
              label="Date of Birth"
              type="date"
              value={pf.dateOfBirth}
              onChange={(v) => setPf((p) => ({ ...p, dateOfBirth: v }))}
            />
            <Sel
              label="Gender"
              value={pf.gender}
              onChange={(v) => setPf((p) => ({ ...p, gender: v }))}
              opts={[
                { v: "male", l: "Male" },
                { v: "female", l: "Female" },
                { v: "other", l: "Other" },
              ]}
            />
            <Inp
              label="Street"
              value={pf.address.street}
              onChange={(v) =>
                setPf((p) => ({ ...p, address: { ...p.address, street: v } }))
              }
            />
            <Inp
              label="City"
              value={pf.address.city}
              onChange={(v) =>
                setPf((p) => ({ ...p, address: { ...p.address, city: v } }))
              }
            />
            <Inp
              label="State"
              value={pf.address.state}
              onChange={(v) =>
                setPf((p) => ({ ...p, address: { ...p.address, state: v } }))
              }
            />
            <Inp
              label="Country"
              value={pf.address.country}
              onChange={(v) =>
                setPf((p) => ({ ...p, address: { ...p.address, country: v } }))
              }
              placeholder="Nigeria"
            />
            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: 12,
                color: C.m,
                padding: "6px 10px",
                background: C.bg,
                borderRadius: 6,
              }}
            >
              Coordinates:{" "}
              {pf.address.coordinates?.lat
                ? `${pf.address.coordinates.lat.toFixed(4)}, ${pf.address.coordinates.lng.toFixed(4)}`
                : "Requesting location..."}
            </div>
          </div>
        )}

        {/* ── Doctor Form ── */}
        {user.role === "doctor" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {Object.keys(df).map((k) => (
              <Inp
                key={k}
                label={k}
                value={df[k as keyof typeof df]}
                onChange={(v) => setDf((p) => ({ ...p, [k]: v }))}
              />
            ))}
          </div>
        )}

        {/* ── Pharmacy Form ── */}
        {user.role === "pharmacy" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {(
              [
                "pharmacyName",
                "licenseNumber",
                "phone",
                "operatingHours",
              ] as const
            ).map((k) => (
              <Inp
                key={k}
                label={k}
                value={phf[k] as string}
                onChange={(v) => setPhf((p) => ({ ...p, [k]: v }))}
              />
            ))}
            <Inp
              label="Street"
              value={phf.address.street}
              onChange={(v) =>
                setPhf((p) => ({ ...p, address: { ...p.address, street: v } }))
              }
            />
            <Inp
              label="City"
              value={phf.address.city}
              onChange={(v) =>
                setPhf((p) => ({ ...p, address: { ...p.address, city: v } }))
              }
            />
            <Inp
              label="State"
              value={phf.address.state}
              onChange={(v) =>
                setPhf((p) => ({ ...p, address: { ...p.address, state: v } }))
              }
            />
            <Inp
              label="Country"
              value={phf.address.country}
              onChange={(v) =>
                setPhf((p) => ({ ...p, address: { ...p.address, country: v } }))
              }
              placeholder="Nigeria"
            />
            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: 12,
                color: C.m,
                padding: "6px 10px",
                background: C.bg,
                borderRadius: 6,
              }}
            >
              Coordinates:{" "}
              {phf.address.coordinates?.lat
                ? `${phf.address.coordinates.lat.toFixed(4)}, ${phf.address.coordinates.lng.toFixed(4)}`
                : "Requesting location..."}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Btn full sz="lg" onClick={save} disabled={saving || !isValid}>
            {saving ? <Spin /> : "Create Profile & Continue"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};
