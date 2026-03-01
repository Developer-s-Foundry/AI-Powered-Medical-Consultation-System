import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { Card, Btn, Av, Bdg, Tag, Tbl, StatCard } from "./Shared";
import { SBdg } from "./Shared";

type AppointmentsPageProps = {
  onNav: (path: string) => void;
};

export const AppointmentsPage = ({ onNav }: AppointmentsPageProps) => {
  const navigate = useNavigate();
  const docMap = Object.fromEntries(MOCK_DB.doctors.map((d) => [d.id, d]));

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
          <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
            <Tag method="GET" path="/api/appointments" />
            <Tag method="POST" path="/api/appointments/book" />
          </div>
        </div>
        <Btn onClick={() => navigate("find-doctors")}>+ Book</Btn>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard icon="" label="total" value={MOCK_DB.appointments.length} />
        <StatCard
          icon=""
          label="confirmed"
          value={
            MOCK_DB.appointments.filter((a) => a.status === "confirmed").length
          }
          c={C.g}
          bg={C.gl}
        />
        <StatCard
          icon=""
          label="pending"
          value={
            MOCK_DB.appointments.filter((a) => a.status === "pending").length
          }
          c={C.w}
          bg={C.wl}
        />
      </div>

      <Card>
        <Tbl
          cols={[
            {
              k: "doctor",
              r: (r) => {
                const d = docMap[r.doctorId];
                return (
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <Av
                      name={d ? `${d.firstName} ${d.lastName}` : "?"}
                      size={26}
                    />
                    {d ? `Dr. ${d.firstName} ${d.lastName}` : "—"}
                  </div>
                );
              },
            },
            { k: "date" },
            { k: "time" },
            { k: "reason" },
            { k: "type", r: (r) => <Bdg>{r.type}</Bdg> },
            { k: "status", r: (r) => SBdg(r.status) },
            {
              k: "",
              r: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn sz="xs" v="secondary">
                    View
                  </Btn>
                  {r.status === "confirmed" && (
                    <Btn sz="xs" v="ghost" onClick={() => onNav("payments")}>
                      Pay
                    </Btn>
                  )}
                </div>
              ),
            },
          ]}
          rows={MOCK_DB.appointments}
        />
      </Card>
    </div>
  );
};
