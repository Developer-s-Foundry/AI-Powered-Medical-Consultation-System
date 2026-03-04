import { useState } from "react";
import { haversine } from "./Geo";

export type Coords = { lat: number; lng: number };
export type LocStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

export const useLocation = (onGranted: (coords: Coords) => void) => {
  const [location, setLocation] = useState<Coords | null>(null);
  const [locStatus, setLocStatus] = useState<LocStatus>("idle");
  const [locLabel, setLocLabel] = useState("");
  const [manualAddr, setManualAddr] = useState("");
  const [showManual, setShowManual] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("unsupported");
      return;
    }
    setLocStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setLocStatus("granted");
        setLocLabel(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        onGranted(coords);
      },
      () => {
        setLocStatus("denied");
        setShowManual(true);
      },
      { timeout: 8000 },
    );
  };

  const useManualAddress = () => {
    // In production: geocode manualAddr → coords via Google Maps API
    const coords = { lat: 6.455, lng: 3.3841 }; // fallback: Lagos Island
    setLocation(coords);
    setLocStatus("granted");
    setLocLabel(manualAddr || "Lagos Island, Lagos");
    onGranted(coords);
    setShowManual(false);
  };

  return {
    location,
    locStatus,
    locLabel,
    manualAddr,
    setManualAddr,
    showManual,
    requestLocation,
    useManualAddress,
  };
};
