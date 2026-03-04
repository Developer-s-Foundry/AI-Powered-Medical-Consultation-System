import { useState, useEffect } from "react";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Av, Bdg, Hr, Spin } from "./Shared";

type Doctor = {
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  yearsOfExperience?: number;
  hospitalName?: string;
  consultationFee?: number;
  isVerified?: boolean;
};

type DoctorsTabProps = {
  onBook?: (doc: Record<string, unknown>) => void;
};

export const DoctorsTab = ({ onBook }: DoctorsTabProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    call(EP.DOCTORS_SEARCH)
      .then((r) => setDoctors(r.data || r.doctors || []))
      .catch(() => setErr("Failed to load doctors."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin />
      </div>
    );

  if (err)
    return <div style={{ fontSize: 13, color: C.d, padding: 20 }}>{err}</div>;

  if (doctors.length === 0)
    return (
      <div style={{ fontSize: 13, color: C.m, padding: 20 }}>
        No doctors found. Complete the AI chat to get recommendations.
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 13, color: C.m }}>
        Doctors recommended based on your symptoms.
      </div>

      {doctors.map((doc) => (
        <Card key={doc.userId} style={{ border: `1.5px solid ${C.b}` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Av name={`${doc.firstName} ${doc.lastName}`} size={48} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    Dr. {doc.firstName} {doc.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: C.m }}>
                    {doc.specialty} ·{" "}
                    {doc.yearsOfExperience
                      ? `${doc.yearsOfExperience} yrs exp`
                      : ""}
                  </div>
                  {doc.hospitalName && (
                    <div style={{ fontSize: 12, color: C.m }}>
                      🏥 {doc.hospitalName}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                  }}
                >
                  {doc.isVerified ? (
                    <Bdg c={C.g} bg={C.gl} dot>
                      Verified
                    </Bdg>
                  ) : (
                    <Bdg c={C.w} bg={C.wl}>
                      Pending
                    </Bdg>
                  )}
                  {doc.consultationFee && (
                    <Bdg>₦{Number(doc.consultationFee).toLocaleString()}</Bdg>
                  )}
                </div>
              </div>
              <Hr my={10} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  sz="sm"
                  onClick={() => onBook?.(doc as Record<string, unknown>)}
                >
                  📅 Book Appointment
                </Btn>
                <Btn sz="sm" v="ghost" onClick={() => {}}>
                  View Profile
                </Btn>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
