import { useState } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Bdg, Hr, Tag } from "./Shared";
import { haversine, fmtDist } from "./Geo";
import type { Coords, LocStatus } from "./UseLocation";

type PharmaciesTabProps = {
  location: Coords | null;
  locStatus: LocStatus;
  locLabel: string;
  onRequestLocation: () => void;
};

export const PharmaciesTab = ({
  location,
  locStatus,
  locLabel,
  onRequestLocation,
}: PharmaciesTabProps) => {
  const [nearbyPharms, setNearbyPharms] = useState<any[]>([]);
  const [pharmLoading, setPharmLoading] = useState(false);
  const [pharmDrug, setPharmDrug] = useState("");

  const fetchNearbyPharms = async (coords: Coords, drug: string = "") => {
    setPharmLoading(true);
    try {
      const params = new URLSearchParams({
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
        radius: "20",
        ...(drug && { drug }),
      });
      const res = await call(`${EP.PHARM_NEARBY}?${params}`);
      setNearbyPharms(
        (res.data?.pharmacies || res.pharmacies || []).map((ph: any) => ({
          ...ph,
          distance: haversine(coords.lat, coords.lng, ph.lat, ph.lng),
        })),
      );
    } catch {
      setNearbyPharms([]);
    }
    setPharmLoading(false);
  };

  const filterByDrug = (drug: string) => {
    setPharmDrug(drug);
    if (location) fetchNearbyPharms(location, drug);
  };

  return (
    <div>
      {/* Search bar */}
      <Card style={{ marginBottom: 16 }} p={14}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 160 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.t,
                fontFamily: "monospace",
                marginBottom: 4,
              }}
            >
              Filter by drug in stock
            </div>
            <input
              value={pharmDrug}
              onChange={(e) => setPharmDrug(e.target.value)}
              placeholder="e.g. Amlodipine"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1.5px solid ${C.b}`,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <Btn sz="sm" onClick={() => filterByDrug(pharmDrug)}>
            Search
          </Btn>
          <Btn
            sz="sm"
            v="ghost"
            onClick={() => {
              setPharmDrug("");
              if (location) fetchNearbyPharms(location, "");
            }}
          >
            Clear
          </Btn>
          {locStatus !== "granted" && (
            <Btn sz="sm" v="secondary" onClick={onRequestLocation}>
              Detect Location
            </Btn>
          )}
        </div>

        {locStatus === "granted" && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: C.g,
            }}
          >
            <span>✓</span>
            <span>
              Showing pharmacies near <strong>{locLabel}</strong>
            </span>
            <span style={{ color: C.m }}>· Sorted by distance</span>
          </div>
        )}
        {locStatus !== "granted" && locStatus !== "requesting" && (
          <div style={{ marginTop: 10, fontSize: 12, color: C.m }}>
            Share your location to sort pharmacies by distance from you.
          </div>
        )}
      </Card>

      <div style={{ marginBottom: 12, display: "flex", gap: 6 }}>
        <Tag
          method="GET"
          path="/api/profile/pharmacies/nearby?lat=&lng=&radius=&drug="
        />
        <Tag method="POST" path="/api/ai/pharmacy-match" />
      </div>

      {pharmLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: C.m }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div>Finding pharmacies near you…</div>
        </div>
      ) : nearbyPharms.length === 0 ? (
        <Card style={{ textAlign: "center" }} p={40}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🏪</div>
          <div style={{ fontWeight: 700, color: C.t, marginBottom: 4 }}>
            No pharmacies found
          </div>
          <div style={{ fontSize: 13, color: C.m, marginBottom: 16 }}>
            {locStatus !== "granted"
              ? "Share your location to find nearby pharmacies."
              : "Try clearing the drug filter or expanding your search."}
          </div>
          {locStatus !== "granted" && (
            <Btn onClick={onRequestLocation}>📍 Share Location</Btn>
          )}
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {nearbyPharms.map((ph) => (
            <Card key={ph.id} style={{ border: `1px solid ${C.b}` }}>
              <div
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: C.gl,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  🏪
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {ph.pharmacyName}
                      </div>
                      <div style={{ fontSize: 12, color: C.m, marginTop: 2 }}>
                        📍 {ph.address}
                      </div>
                      <div style={{ fontSize: 12, color: C.m }}>
                        📞 {ph.phoneNumber} · ⏰ {ph.operatingHours}
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
                      {ph.distance != null && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            background: C.pl,
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.p,
                          }}
                        >
                          📍 {fmtDist(ph.distance)} away
                        </div>
                      )}
                      {ph.isVerified ? (
                        <Bdg c={C.g} bg={C.gl} dot>
                          Verified
                        </Bdg>
                      ) : (
                        <Bdg c={C.w} bg={C.wl}>
                          Unverified
                        </Bdg>
                      )}
                    </div>
                  </div>

                  {/* Drugs in stock */}
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: C.m,
                        fontFamily: "monospace",
                      }}
                    >
                      drugs in stock:
                    </span>
                    {ph.drugs?.map((d: string) => {
                      const matched =
                        pharmDrug &&
                        d.toLowerCase().includes(pharmDrug.toLowerCase());
                      return (
                        <span
                          key={d}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            background: matched ? C.gl : C.bg,
                            color: matched ? C.g : C.m,
                            border: `1px solid ${matched ? C.g : C.b}`,
                            borderRadius: 12,
                            fontWeight: matched ? 700 : 400,
                          }}
                        >
                          {d}
                        </span>
                      );
                    })}
                  </div>

                  {/* Rating + delivery */}
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: 12, color: C.w }}>
                      {"★".repeat(Math.round(ph.rating || 0))}
                      <span style={{ color: C.m }}>
                        {"★".repeat(5 - Math.round(ph.rating || 0))}
                      </span>{" "}
                      <span style={{ color: C.m }}>{ph.rating}</span>
                    </div>
                    {ph.deliveryAvailable && (
                      <Bdg c={C.pu} bg={C.pul}>
                        🛵 Delivery Available
                      </Bdg>
                    )}
                  </div>

                  <Hr my={10} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn sz="sm">Get Directions</Btn>
                    <Btn sz="sm" v="secondary">
                      📞 Call Pharmacy
                    </Btn>
                    {ph.deliveryAvailable && (
                      <Btn sz="sm" v="ghost">
                        🛵 Request Delivery
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
