import { useNavigate } from "react-router-dom";
import { C } from "./Shared";
import { Card, Btn, Hr, StatCard } from "./Shared";
import type { AuthUser, OperationDays } from "../types";

type PharmacyDashboardProps = {
  user: AuthUser;
  profile: {
    pharmacyName?: string;
    phone?: string;
    lincenseNumber?: string;
    isVerified?: boolean;
    operationDays?: OperationDays;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    [key: string]: unknown;
  };
};

export const PharmacyDashboard = ({ profile }: PharmacyDashboardProps) => {
  console.log("PHARMACY PROFILE:", JSON.stringify(profile, null, 2));
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          {profile.pharmacyName ?? "—"}
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
          Pharmacy Profile Fields
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {/* Basic fields */}
          {["pharmacyName", "lincenseNumber", "phone"].map((k) => (
            <div key={k}>
              <div
                style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
              >
                {k}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {String(profile[k] ?? "—")}
              </div>
            </div>
          ))}

          {/* Address */}
          <div>
            <div style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}>
              address
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
              {profile.address
                ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country}`
                : "—"}
            </div>
          </div>

          {/* Operation Days */}
          <div style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                fontSize: 11,
                color: C.m,
                fontFamily: "monospace",
                marginBottom: 6,
              }}
            >
              operationDays
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.operationDays
                ? Object.entries(profile.operationDays)
                    .filter(([, v]) => v.isAvailable)
                    .map(([day, v]) => (
                      <span
                        key={day}
                        style={{
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: C.pl,
                          color: C.p,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {day} {v.startTime}–{v.endTime}
                      </span>
                    ))
                : "—"}
            </div>
          </div>
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
