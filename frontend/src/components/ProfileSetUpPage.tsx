import { useState, useEffect } from "react";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Inp, Sel, Alrt, Spin, Tag } from "./Shared";
import type { AuthUser, OperationDays, Profile } from "../types";

type ProfileSetupPageProps = {
  user: AuthUser;
  onComplete: (profile: Profile) => void;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const defaultDays = (): OperationDays =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      { isAvailable: false, startTime: "08:00", endTime: "18:00" },
    ]),
  );

const endpointMap = {
  patient: "/api/v1/profiles/patients/profile",
  doctor: "/api/v1/profiles/doctors/profile",
  pharmacy: "/api/v1/profiles/pharmacies/profile",
};

type DaySlot = { isAvailable: boolean; startTime: string; endTime: string };

const DayScheduler = ({
  label,
  days,
  onToggle,
  onTimeChange,
}: {
  label: string;
  days: OperationDays;
  onToggle: (day: string) => void;
  onTimeChange: (
    day: string,
    field: "startTime" | "endTime",
    val: string,
  ) => void;
}) => (
  <div>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.t,
        fontFamily: "monospace",
        marginBottom: 8,
      }}
    >
      {label}{" "}
      <span style={{ color: C.m, fontWeight: 400 }}>
        — select days and hours
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {DAYS.map((day) => {
        const slot: DaySlot = days[day];
        return (
          <div
            key={day}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1.5px solid ${slot.isAvailable ? C.p : C.b}`,
              background: slot.isAvailable ? C.pl : C.s,
            }}
          >
            <button
              onClick={() => onToggle(day)}
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: slot.isAvailable ? C.p : C.b,
                position: "relative",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: slot.isAvailable ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
            <span
              style={{
                width: 90,
                fontSize: 13,
                fontWeight: slot.isAvailable ? 700 : 400,
                color: slot.isAvailable ? C.p : C.m,
                textTransform: "capitalize",
              }}
            >
              {day}
            </span>
            {slot.isAvailable && (
              <>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    onTimeChange(day, "startTime", e.target.value)
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${C.b}`,
                    fontSize: 12,
                    fontFamily: "inherit",
                    background: C.s,
                    color: C.t,
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: C.m }}>to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => onTimeChange(day, "endTime", e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${C.b}`,
                    fontSize: 12,
                    fontFamily: "inherit",
                    background: C.s,
                    color: C.t,
                    outline: "none",
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

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
    consultationFee: "0",
  });

  const [dAvailableDays, setDAvailableDays] =
    useState<OperationDays>(defaultDays());

  const [phf, setPhf] = useState({
    pharmacyName: "",
    phone: "",
    licenseNumber: "",
    operationDays: defaultDays(),
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      coordinates: { lat: 0, lng: 0 },
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
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
    setSaving(true);
    setErr("");
    try {
      let body: Record<string, unknown>;
      let endpoint: string;

      if (user.role === "patient") {
        body = {
          firstName: pf.firstName,
          lastName: pf.lastName,
          phone: pf.phone,
          dateOfBirth: pf.dateOfBirth,
          gender: pf.gender,
          address: pf.address,
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
          consultationFee: Number(df.consultationFee),
          consultationSchedule: { availableDays: dAvailableDays },
        };
        endpoint = EP.PROFILE_DOCTOR;
      } else {
        body = {
          pharmacyName: phf.pharmacyName,
          phone: phf.phone,
          lincenseNumber: phf.licenseNumber,
          operationDays: phf.operationDays,
          address: phf.address,
        };
        endpoint = EP.PROFILE_PHARMACY;
      }

      const res = await call(endpoint, "POST", body);
      onComplete(res.data || res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "An error occurred");
    }
    setSaving(false);
  };

  const hasAvailableDoctorDay = Object.values(dAvailableDays).some(
    (d) => d.isAvailable,
  );
  const hasAvailablePharmacyDay = Object.values(phf.operationDays).some(
    (d) => d.isAvailable,
  );

  const isValid =
    user.role === "patient"
      ? pf.firstName &&
        pf.lastName &&
        pf.address.street &&
        pf.address.city &&
        pf.address.state &&
        pf.address.country
      : user.role === "doctor"
        ? df.firstName &&
          df.lastName &&
          df.specialty &&
          df.licenseNumber &&
          hasAvailableDoctorDay
        : phf.pharmacyName &&
          phf.phone &&
          phf.licenseNumber &&
          hasAvailablePharmacyDay &&
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {(Object.keys(df) as (keyof typeof df)[]).map((k) => (
                <Inp
                  key={k}
                  label={k}
                  value={df[k]}
                  onChange={(v) => setDf((p) => ({ ...p, [k]: v }))}
                />
              ))}
            </div>
            <DayScheduler
              label="availableDays"
              days={dAvailableDays}
              onToggle={(day) =>
                setDAvailableDays((p) => ({
                  ...p,
                  [day]: { ...p[day], isAvailable: !p[day].isAvailable },
                }))
              }
              onTimeChange={(day, field, val) =>
                setDAvailableDays((p) => ({
                  ...p,
                  [day]: { ...p[day], [field]: val },
                }))
              }
            />
            {!hasAvailableDoctorDay && (
              <div
                style={{
                  fontSize: 12,
                  color: C.d,
                  padding: "6px 10px",
                  background: "#fff0f0",
                  borderRadius: 6,
                }}
              >
                ⚠️ Please select at least one available day
              </div>
            )}
          </div>
        )}

        {/* ── Pharmacy Form ── */}
        {user.role === "pharmacy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Inp
                label="Pharmacy Name"
                value={phf.pharmacyName}
                onChange={(v) => setPhf((p) => ({ ...p, pharmacyName: v }))}
              />
              <Inp
                label="License Number"
                value={phf.licenseNumber}
                onChange={(v) => setPhf((p) => ({ ...p, licenseNumber: v }))}
              />
              <Inp
                label="Phone"
                value={phf.phone}
                onChange={(v) => setPhf((p) => ({ ...p, phone: v }))}
                placeholder="+2348011111111"
              />
              <Inp
                label="Street"
                value={phf.address.street}
                onChange={(v) =>
                  setPhf((p) => ({
                    ...p,
                    address: { ...p.address, street: v },
                  }))
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
                  setPhf((p) => ({
                    ...p,
                    address: { ...p.address, country: v },
                  }))
                }
                placeholder="Nigeria"
              />
              <div
                style={{
                  fontSize: 12,
                  color: C.m,
                  padding: "6px 10px",
                  background: C.bg,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                📍{" "}
                {phf.address.coordinates?.lat
                  ? `${phf.address.coordinates.lat.toFixed(4)}, ${phf.address.coordinates.lng.toFixed(4)}`
                  : "Requesting location..."}
              </div>
            </div>
            <DayScheduler
              label="operationDays"
              days={phf.operationDays}
              onToggle={(day) =>
                setPhf((p) => ({
                  ...p,
                  operationDays: {
                    ...p.operationDays,
                    [day]: {
                      ...p.operationDays[day],
                      isAvailable: !p.operationDays[day].isAvailable,
                    },
                  },
                }))
              }
              onTimeChange={(day, field, val) =>
                setPhf((p) => ({
                  ...p,
                  operationDays: {
                    ...p.operationDays,
                    [day]: { ...p.operationDays[day], [field]: val },
                  },
                }))
              }
            />
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
