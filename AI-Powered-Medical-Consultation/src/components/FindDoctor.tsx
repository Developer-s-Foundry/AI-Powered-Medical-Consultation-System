import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Inp, Av, Bdg, Hr, Tag } from "./Shared";

type Doctor = {
  userId: string; // backend returns userId not id
  firstName: string;
  lastName: string;
  specialty: string;
  hospitalName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

type DoctorProfile = Doctor & {
  gender?: string;
  consultationSchedule?: {
    availableDays?: Record<
      string,
      { isAvailable: boolean; startTime: string; endTime: string }
    >;
  };
  paymentDetails?: {
    consultationFees?: {
      amount?: number;
      currency?: string;
    };
  };
};

export const FindDoctorsPage = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DoctorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    call(`${EP.DOCTORS_SEARCH}`)
      .then((r) => setDocs(r.data || []))
      .catch(() => setDocs([]));
  }, []);

  const search = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (spec) params.append("specialty", spec);
      const r = await call(`${EP.DOCTORS_SEARCH}?${params.toString()}`);
      setDocs(r.data || []);
    } catch {
      setDocs([]);
    }
  };

  const viewProfile = async (doc: Doctor) => {
    setSelectedDoc(doc as DoctorProfile); // show immediately with list data
    setLoadingProfile(true);
    try {
      const r = await call(EP.DOCTOR_PROFILE(doc.userId));
      setSelectedDoc(r.data || r); // update with full profile from getProfileById
    } catch {
      // keep showing list data if full fetch fails
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeModal = () => setSelectedDoc(null);

  const getAvailableDays = (doc: DoctorProfile) => {
    const schedule = doc.consultationSchedule?.availableDays;
    if (!schedule) return "—";
    const days = Object.entries(schedule)
      .filter(([, v]) => v.isAvailable)
      .map(([day, v]) => `${day} (${v.startTime}–${v.endTime})`)
      .join(", ");
    return days || "—";
  };

  const getConsultationFee = (doc: DoctorProfile) => {
    const fee = doc.paymentDetails?.consultationFees?.amount;
    return fee ? `₦${Number(fee).toLocaleString()}` : "—";
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
          Find a Doctor
        </h1>
        <div style={{ marginTop: 4 }}>
          <Tag method="GET" path="/api/v1/profiles/doctors/search" />
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <Inp
            label="name"
            value={q}
            onChange={setQ}
            placeholder="Dr. Okonkwo"
          />
          <Inp
            label="specialization"
            value={spec}
            onChange={setSpec}
            placeholder="Cardiology"
          />
          <Btn onClick={search}>Search</Btn>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {docs.length === 0 && (
          <div style={{ color: C.m, fontSize: 13, gridColumn: "1 / -1" }}>
            No doctors found.
          </div>
        )}
        {docs.map((d) => (
          <Card key={d.userId}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <Av name={`${d.firstName} ${d.lastName}`} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  Dr. {d.firstName} {d.lastName}
                </div>
                <div style={{ fontSize: 12, color: C.m }}>{d.specialty}</div>
                <div style={{ fontSize: 12, color: C.m }}>{d.hospitalName}</div>
                {d.address?.city && (
                  <div style={{ fontSize: 12, color: C.m }}>
                    📍 {d.address.city}
                    {d.address.state ? `, ${d.address.state}` : ""}
                  </div>
                )}
              </div>
            </div>
            <Hr my={10} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn sz="sm" onClick={() => navigate("/appointments")}>
                Book Appointment
              </Btn>
              <Btn sz="sm" v="ghost" onClick={() => viewProfile(d)}>
                View Profile
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Doctor Profile Modal ── */}
      {selectedDoc && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Card>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: C.t }}>
                  Doctor Profile
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 22,
                    color: C.m,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {loadingProfile ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 0",
                    color: C.m,
                    fontSize: 13,
                  }}
                >
                  Loading full profile…
                </div>
              ) : (
                <>
                  {/* Avatar + name */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Av
                      name={`${selectedDoc.firstName} ${selectedDoc.lastName}`}
                      size={64}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 18,
                          color: C.t,
                        }}
                      >
                        Dr. {selectedDoc.firstName} {selectedDoc.lastName}
                      </div>
                      <div style={{ fontSize: 13, color: C.m, marginTop: 2 }}>
                        {selectedDoc.specialty}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <Bdg c={C.g} bg={C.gl} dot>
                          Verified
                        </Bdg>
                      </div>
                    </div>
                  </div>

                  <Hr my={14} />

                  {/* Info grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      {
                        label: "Hospital",
                        value: selectedDoc.hospitalName || "—",
                      },
                      { label: "Gender", value: selectedDoc.gender || "—" },
                      { label: "Phone", value: selectedDoc.phone || "—" },
                      {
                        label: "Consultation Fee",
                        value: getConsultationFee(selectedDoc),
                      },
                      {
                        label: "Address",
                        value: selectedDoc.address
                          ? [
                              selectedDoc.address.street,
                              selectedDoc.address.city,
                              selectedDoc.address.state,
                              selectedDoc.address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "—",
                      },
                      {
                        label: "Available Days",
                        value: getAvailableDays(selectedDoc),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          background: C.bg,
                          padding: "10px 12px",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: C.m,
                            fontFamily: "monospace",
                            marginBottom: 3,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.t,
                            wordBreak: "break-word",
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      full
                      onClick={() => {
                        closeModal();
                        navigate("/appointments");
                      }}
                    >
                      📅 Book Appointment
                    </Btn>
                    <Btn v="ghost" sz="sm" onClick={closeModal}>
                      Close
                    </Btn>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
