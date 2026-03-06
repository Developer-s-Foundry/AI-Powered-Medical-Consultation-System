import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Bdg, Alrt, Spin, Hr, StatCard, SBdg } from "./Shared";
import type { AuthUser } from "../types";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type DaySlot = { isAvailable: boolean; startTime: string; endTime: string };
type AvailableDays = Record<string, DaySlot>;

const defaultDays = (): AvailableDays =>
  Object.fromEntries(
    DAYS.map((d) => [
      d,
      { isAvailable: false, startTime: "08:00", endTime: "18:00" },
    ]),
  );

type DoctorDashboardProps = {
  user: AuthUser;
  profile: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    hospitalName?: string;
    phone?: string;
    consultationFee?: number;
    yearsOfExperience?: number;
    consultationSchedule?: {
      availableDays?: AvailableDays;
    };
    address?: { street: string; city: string; state: string; country: string };
    [key: string]: unknown;
  };
};

type Appointment = {
  id: string;
  patientName?: string;
  date?: string;
  time?: string;
  status?: string;
  reason?: string;
};

export const DoctorDashboard = ({ profile }: DoctorDashboardProps) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableDays, setAvailableDays] = useState<AvailableDays>(
    () => profile.consultationSchedule?.availableDays ?? defaultDays(), // ✅ lazy initializer
  );
  const [scheduleOk, setScheduleOk] = useState("");
  const [scheduleErr, setScheduleErr] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    call(EP.DOCTOR_APPOINTMENTS)
      .then((r) => setAppointments(r.data || r))
      .catch(() => setAppointments([]));
  }, []);

  const toggleDay = (day: string) =>
    setAvailableDays((p) => ({
      ...p,
      [day]: { ...p[day], isAvailable: !p[day].isAvailable },
    }));

  const updateDayTime = (
    day: string,
    field: "startTime" | "endTime",
    val: string,
  ) => setAvailableDays((p) => ({ ...p, [day]: { ...p[day], [field]: val } }));

  const saveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleErr("");
    setScheduleOk("");
    try {
      await call(`${EP.DOCTOR_UPDATE_AVAILABLE_DAYS}`, "PUT", {
        availableDays,
      });
      setScheduleOk("Availability updated!");
      setShowSchedule(false);
    } catch (e: unknown) {
      setScheduleErr(
        e instanceof Error ? e.message : "Failed to update schedule",
      );
    }
    setSavingSchedule(false);
  };

  const enabledDays = DAYS.filter((d) => availableDays[d]?.isAvailable);

  return (
    <div>
      {/* Header */}
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
            Dr. {profile.firstName} {profile.lastName}
          </h1>
        </div>
        <Bdg c={C.g} bg={C.gl} dot>
          Active
        </Bdg>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="🩺"
          label="specialty"
          value={profile.specialty ?? "—"}
        />
        <StatCard
          icon="📅"
          label="yearsOfExperience"
          value={
            profile.yearsOfExperience ? `${profile.yearsOfExperience} yrs` : "—"
          }
          c={C.g}
          bg={C.gl}
        />
        <StatCard
          icon="🏥"
          label="hospital"
          value={profile.hospitalName ?? "—"}
          c={C.pu}
          bg={C.pul}
        />
        <StatCard
          icon="💰"
          label="consultationFee"
          value={
            profile.consultationFee
              ? `₦${Number(profile.consultationFee).toLocaleString()}`
              : "—"
          }
          c={C.w}
          bg={C.wl}
        />
      </div>

      {/* Availability Schedule Card */}
      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            📅 Availability Schedule
          </div>
          <Btn
            sz="sm"
            v="secondary"
            onClick={() => setShowSchedule(!showSchedule)}
          >
            {showSchedule ? "Cancel" : "Edit Schedule"}
          </Btn>
        </div>

        {scheduleOk && <Alrt type="success">{scheduleOk}</Alrt>}
        {scheduleErr && <Alrt>{scheduleErr}</Alrt>}

        {/* Read-only summary */}
        {!showSchedule && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {enabledDays.length === 0 ? (
              <div style={{ fontSize: 13, color: C.m }}>
                No availability set. Click "Edit Schedule" to add your available
                days.
              </div>
            ) : (
              enabledDays.map((day) => (
                <div
                  key={day}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: C.pl,
                    border: `1px solid ${C.p}`,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: C.p,
                      textTransform: "capitalize",
                    }}
                  >
                    {day}
                  </span>
                  <span style={{ color: C.m, marginLeft: 6 }}>
                    {availableDays[day].startTime} –{" "}
                    {availableDays[day].endTime}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Editable schedule */}
        {showSchedule && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
            }}
          >
            {DAYS.map((day) => {
              const slot = availableDays[day];
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
                    onClick={() => toggleDay(day)}
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
                          updateDayTime(day, "startTime", e.target.value)
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
                        onChange={(e) =>
                          updateDayTime(day, "endTime", e.target.value)
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
                    </>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop: 8 }}>
              <Btn onClick={saveSchedule} disabled={savingSchedule}>
                {savingSchedule ? <Spin /> : "Save Schedule"}
              </Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Profile & Appointments Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            DoctorProfile Fields
          </div>
          {["specialty", "phone", "gender", "userId", "createdAt"].map((k) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: `1px solid ${C.b}`,
                fontSize: 13,
              }}
            >
              <span
                style={{ color: C.m, fontFamily: "monospace", fontSize: 11 }}
              >
                {k}
              </span>
              <span style={{ fontWeight: 600 }}>
                {String(profile[k] ?? "—").slice(0, 24)}
              </span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Today's Appointments
          </div>
          {appointments.length === 0 && (
            <div style={{ fontSize: 13, color: C.m }}>
              No appointments today.
            </div>
          )}
          {appointments.map((apt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: C.bg,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {apt.reason}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>
                  {apt.date} · {apt.time}
                </div>
              </div>
              {SBdg(apt.status)}
            </div>
          ))}
          <Hr />
          <Btn
            full
            v="secondary"
            sz="sm"
            onClick={() => navigate("/prescriptions-doctor")}
          >
            📋 Prescriptions
          </Btn>
        </Card>
      </div>
    </div>
  );
};
