import { C } from "./Shared";
import { Card, Btn, Av, Bdg, Hr } from "./Shared";

type DoctorsTabProps = {
  onBook?: (doc: any) => void;
};

export const DoctorsTab = ({ onBook }: DoctorsTabProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 13, color: C.m }}>
        Doctors recommended based on your symptoms.
      </div>

      {MOCK_DB.doctors.map((doc) => (
        <Card key={doc.id} style={{ border: `1.5px solid ${C.b}` }}>
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
                    {doc.specialization} · {doc.yearsOfExperience} yrs exp
                  </div>
                  <div style={{ fontSize: 12, color: C.m }}>
                    🏥 {doc.hospitalAffiliation}
                  </div>
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
                  <Bdg>₦{Number(doc.consultationFee).toLocaleString()}</Bdg>
                </div>
              </div>
              <Hr my={10} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn sz="sm" onClick={() => onBook?.(doc)}>
                  📅 Book Appointment
                </Btn>
                <Btn sz="sm" v="ghost">
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
