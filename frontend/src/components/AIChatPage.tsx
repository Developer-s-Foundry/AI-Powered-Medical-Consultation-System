import { useState } from "react";
import { C } from "./Shared";
import { Card, Btn } from "./Shared";
import { useLocation } from "./UseLocation";
import { ChatTab } from "./ChatTab";
import { DoctorsTab } from "./DoctorsTab";
import { PharmaciesTab } from "./PharmaciesTab";

type AIChatPageProps = {
  user: { id: string; name: string };
  onBook?: (doc: Record<string, unknown>) => void;
};

export const AIChatPage = ({ user, onBook }: AIChatPageProps) => {
  const [activeTab, setActiveTab] = useState("chat");

  const {
    location,
    locStatus,
    locLabel,
    manualAddr,
    setManualAddr,
    showManual,
    requestLocation,
    useManualAddress,
  } = useLocation(() => {});

  const tabs = [
    { id: "chat", label: "💬 Chat" },
    { id: "doctors", label: "🩺 Doctors" },
    { id: "pharmacies", label: "🏪 Pharmacies" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.t, margin: 0 }}>
            AI Medical Assistant
          </h1>
        </div>

        {/* Location pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {locStatus === "granted" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: C.gl,
                border: `1px solid ${C.g}`,
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              <span>📍</span>
              <span style={{ color: C.g, fontWeight: 600 }}>{locLabel}</span>
              <button
                onClick={requestLocation}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.m,
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                Change
              </button>
            </div>
          ) : locStatus === "requesting" ? (
            <div
              style={{
                padding: "5px 12px",
                background: C.wl,
                border: `1px solid ${C.w}`,
                borderRadius: 20,
                fontSize: 12,
                color: C.w,
              }}
            >
              Detecting location…
            </div>
          ) : (
            <Btn sz="sm" v="secondary" onClick={requestLocation}>
              📍 Share Location
            </Btn>
          )}
        </div>
      </div>

      {/* Manual location entry */}
      {(showManual || locStatus === "denied") && (
        <Card style={{ marginBottom: 14, border: `1px solid ${C.w}` }} p={14}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: C.t,
            }}
          >
            Enter your location to find nearby pharmacies
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={manualAddr}
              onChange={(e) => setManualAddr(e.target.value)}
              placeholder="e.g. Lekki Phase 1, Lagos"
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1.5px solid ${C.b}`,
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <Btn sz="sm" onClick={useManualAddress} disabled={!manualAddr}>
              Use This Location
            </Btn>
          </div>
          {locStatus === "unsupported" && (
            <div style={{ fontSize: 12, color: C.m, marginTop: 6 }}>
              Geolocation is not supported by your browser.
            </div>
          )}
        </Card>
      )}

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 3,
          background: C.bg,
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? C.p : C.m,
              background: activeTab === tab.id ? C.s : "transparent",
              fontFamily: "inherit",
              boxShadow:
                activeTab === tab.id ? "0 1px 4px rgba(0,0,0,.07)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chat" && (
        <ChatTab
          user={user}
          location={location}
          onShowResults={() => setActiveTab("doctors")}
          onRequestLocation={requestLocation}
          onPharmaciesTab={() => setActiveTab("pharmacies")}
        />
      )}

      {activeTab === "doctors" && <DoctorsTab onBook={onBook} />}

      {activeTab === "pharmacies" && (
        <PharmaciesTab
          location={location}
          locStatus={locStatus}
          locLabel={locLabel}
          onRequestLocation={requestLocation}
        />
      )}
    </div>
  );
};
