import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Bdg, Hr, StatCard } from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "../types";

type DoctorDashboardProps = {
  user: AuthUser;
  profile: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    hospitalName?: string;
    phone?: string;
    consultationFee?: number;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
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

  useEffect(() => {
    call(EP.DOCTOR_APPOINTMENTS)
      .then((r) => setAppointments(r.data || r))
      .catch(() => setAppointments([]));
  }, []);

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
            Dr. {profile.firstName} {profile.lastName}
          </h1>
        </div>
        <Bdg c={C.g} bg={C.gl} dot>
          Active
        </Bdg>
      </div>

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
          value={profile.specialty ?? "-"}
        />
        <StatCard
          icon=""
          label="yearsOfExperience"
          value={
            profile.yearsOfExperience ? `${profile.yearsOfExperience} yrs` : "—"
          }
          c={C.g}
          bg={C.gl}
        />
        <StatCard
          icon=""
          label="hospital"
          value={profile.hospitalName ?? "-"}
          c={C.pu}
          bg={C.pul}
        />
        <StatCard
          icon=""
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
          {appointments.map((apt, i: number) => (
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
            onClick={() => navigate("/DoctorRxPage")}
          >
            📋 Prescriptions
          </Btn>
        </Card>
      </div>
    </div>
  );
};
