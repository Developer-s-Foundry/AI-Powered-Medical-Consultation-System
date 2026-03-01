import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Inp, Sel, Alrt, Spin, Av, Bdg, Hr, Tag } from "./Shared";
import type { AuthUser, Profile } from "./Shared";

type PatientProfilePageProps = {
  user: AuthUser;
  profile: Profile;
};

export const PatientProfilePage = ({
  user,
  profile: initialProfile,
}: PatientProfilePageProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [f, setF] = useState({
    firstName: initialProfile?.firstName || "",
    lastName: initialProfile?.lastName || "",
    phone: initialProfile?.phone || "",
    dateOfBirth: initialProfile?.dateOfBirth || "",
    gender: initialProfile?.gender || "male",
  });

  const update = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await call(EP.PROFILE_PATIENT, "PUT", f);
      setProfile(res.data || res);
      setShowEdit(false);
      setOk("Profile updated!");
    } catch (e: any) {
      setErr(e.message);
    }
    setSaving(false);
  };

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
            My Profile
          </h1>
          <div style={{ marginTop: 4 }}>
            <Tag method="GET" path="/api/v1/profiles/patients/profile" />
          </div>
        </div>
        <Btn v="ghost" sz="sm" onClick={() => setShowEdit(!showEdit)}>
          Edit Profile
        </Btn>
      </div>

      {err && <Alrt>{err}</Alrt>}
      {ok && <Alrt type="success">{ok}</Alrt>}

      {showEdit && (
        <Card style={{ border: `1.5px solid ${C.p}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Update Profile
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {(["firstName", "lastName", "phone"] as const).map((k) => (
              <Inp
                key={k}
                label={k}
                value={f[k]}
                onChange={(v) => setF((p) => ({ ...p, [k]: v }))}
              />
            ))}
            <Inp
              label="dateOfBirth"
              type="date"
              value={f.dateOfBirth}
              onChange={(v) => setF((p) => ({ ...p, dateOfBirth: v }))}
            />
            <Sel
              label="gender"
              value={f.gender}
              onChange={(v) => setF((p) => ({ ...p, gender: v }))}
              opts={[
                { v: "male", l: "Male" },
                { v: "female", l: "Female" },
                { v: "other", l: "Other" },
              ]}
            />
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Btn onClick={update} disabled={saving}>
              {saving ? <Spin /> : "Save"}
            </Btn>
            <Btn v="ghost" onClick={() => setShowEdit(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}
      >
        {/* Sidebar */}
        <Card style={{ textAlign: "center" }}>
          <Av name={`${profile?.firstName} ${profile?.lastName}`} size={64} />
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 10 }}>
            {profile?.firstName} {profile?.lastName}
          </div>
          <div style={{ color: C.m, fontSize: 13, marginBottom: 10 }}>
            {user.email}
          </div>
          <Bdg c={C.g} bg={C.gl}>
            Active Patient
          </Bdg>
          <Hr />
          <Btn full onClick={() => navigate("/ai-chat")}>
            AI Consultation
          </Btn>
          <div style={{ marginTop: 8 }}>
            <Btn full v="secondary" onClick={() => navigate("/find-doctors")}>
              Find Doctors
            </Btn>
          </div>
          <div style={{ marginTop: 8 }}>
            <Btn full v="ghost" onClick={() => navigate("/appointments")}>
              Appointments
            </Btn>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Profile Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            {(
              [
                "firstName",
                "lastName",
                "phone",
                "dateOfBirth",
                "gender",
                "userId",
              ] as const
            ).map((k) => (
              <div key={k}>
                <div
                  style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
                >
                  {k}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                  {String((profile as any)?.[k] ?? "—")}
                </div>
              </div>
            ))}
            <div>
              <div
                style={{ fontSize: 11, color: C.m, fontFamily: "monospace" }}
              >
                address
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {profile?.address
                  ? `${profile.address.street}, ${profile.address.city}`
                  : "—"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
