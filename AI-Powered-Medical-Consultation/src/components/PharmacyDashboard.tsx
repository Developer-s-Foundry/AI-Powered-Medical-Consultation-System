import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { Card, Btn, Bdg, Hr, StatCard } from "./Shared";
import type { AuthUser } from "./Shared";

type PharmacyDashboardProps = {
  user: AuthUser;
  profile: any;
};

export const PharmacyDashboard = ({
  user,
  profile,
}: PharmacyDashboardProps) => {
  console.log("PHARMACY PROFILE:", JSON.stringify(profile, null, 2));
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          {profile.pharmacyName}
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon=""
          label="isVerified"
          value={profile.isVerified ? "Yes" : "No"}
          c={profile.isVerified ? C.g : C.w}
          bg={profile.isVerified ? C.gl : C.wl}
        />
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          PharmacyProfile Fields
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {[
            "pharmacyName",
            "lincenseNumber",
            "phoneNumber",
            "address",
            "operatingHours",
            "isVerified",
          ].map((k) => (
            <div key={k}>
              <div
                style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
              >
                {k}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {k === "address"
                  ? `${profile.address?.street}, ${profile.address?.city}, ${profile.address?.state}, ${profile.address?.country}`
                  : String(profile[k] ?? "—")}
              </div>
            </div>
          ))}
        </div>
        <Hr />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn sz="sm" onClick={() => navigate("/manage-drugs")}>
            Drugs
          </Btn>
          <Btn sz="sm" v="ghost" onClick={() => navigate("/rx-queue")}>
            Rx Queue
          </Btn>
        </div>
      </Card>
    </div>
  );
};
