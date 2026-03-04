import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Av, Bdg, Spin } from "./Shared";
import { SBdg } from "./Shared";

type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  type: string;
  status: string;
};

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [docMap, setDocMap] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    call(EP.DOCTOR_APPOINTMENTS)
      .then((r) => {
        const appts: Appointment[] = r.data || r.appointments || [];
        setAppointments(appts);

        const map: Record<string, Doctor> = {};
        appts.forEach((a: Appointment & { doctor?: Doctor }) => {
          if ((a as Appointment & { doctor?: Doctor }).doctor) {
            const d = (a as Appointment & { doctor?: Doctor }).doctor!;
            map[d.id] = d;
          }
        });
        setDocMap(map);
      })
      .catch(() => setErr("Failed to load appointments."))
      .finally(() => setLoading(false));
  }, []);

  const total = appointments.length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const pending = appointments.filter((a) => a.status === "pending").length;

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
            Appointments
          </h1>
        </div>
        <Btn onClick={() => navigate("/find-doctors")}>+ Book</Btn>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Card p={16}>
          <div style={{ fontSize: 11, color: C.m, marginBottom: 4 }}>total</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.t }}>
            {total}
          </div>
        </Card>
        <Card p={16}>
          <div style={{ fontSize: 11, color: C.g, marginBottom: 4 }}>
            confirmed
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.g }}>
            {confirmed}
          </div>
        </Card>
        <Card p={16}>
          <div style={{ fontSize: 11, color: C.w, marginBottom: 4 }}>
            pending
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.w }}>
            {pending}
          </div>
        </Card>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : err ? (
        <Card style={{ textAlign: "center", color: C.d }} p={32}>
          {err}
        </Card>
      ) : appointments.length === 0 ? (
        <Card style={{ textAlign: "center" }} p={40}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          <div style={{ fontWeight: 700, color: C.t, marginBottom: 4 }}>
            No appointments yet
          </div>
          <div style={{ fontSize: 13, color: C.m, marginBottom: 16 }}>
            Use the AI assistant to get matched with a doctor and book an
            appointment.
          </div>
          <Btn onClick={() => navigate("/find-doctors")}>Find a Doctor</Btn>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {appointments.map((a) => {
              const d = docMap[a.doctorId];
              return (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: `1px solid ${C.b}`,
                  }}
                >
                  <Av
                    name={d ? `${d.firstName} ${d.lastName}` : "?"}
                    size={36}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.t }}>
                      {d ? `Dr. ${d.firstName} ${d.lastName}` : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: C.m }}>
                      {a.date} · {a.time} · {a.reason}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <Bdg>{a.type}</Bdg>
                    {SBdg(a.status)}
                    <Btn sz="xs" v="secondary" onClick={() => {}}>
                      View
                    </Btn>
                    {a.status === "confirmed" && (
                      <Btn
                        sz="xs"
                        v="ghost"
                        onClick={() => navigate("/payments")}
                      >
                        Pay
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
