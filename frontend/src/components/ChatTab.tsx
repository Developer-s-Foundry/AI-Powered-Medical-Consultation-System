import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { C } from "./Shared";
import { Card, Btn, Av } from "./Shared";
import { session } from "../session";
import type { Coords } from "./UseLocation";

const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:2026";

type Message = { from: "ai" | "user"; text: string; ts: Date };
type AckResponse = {
  type: string;
  message?: string;
};

type TriageResponse = {
  type: "TRIAGE_RESPONSE";
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  content: string;
  recommendation: {
    rec_type: "mandatory" | "optional";
    doctor?: { full_name: string };
  } | null;
};

type ChatTabProps = {
  user: { id: string; name: string };
  location: Coords | null;
  onShowResults: () => void;
  onRequestLocation: () => void;
  onPharmaciesTab: () => void;
};

const riskColor: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
};

const riskBg: Record<string, string> = {
  HIGH: "#FEF2F2",
  MEDIUM: "#FFFBEB",
  LOW: "#ECFDF5",
};

export const ChatTab = ({
  user,
  location,
  onShowResults,
  onRequestLocation,
  onPharmaciesTab,
}: ChatTabProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text: "Hello! I'm your HealthBridge AI assistant. Describe your symptoms and I'll help you understand them, recommend a doctor, and find nearby pharmacies that stock what you need.",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [triage, setTriage] = useState<TriageResponse | null>(null);
  const [connected, setConnected] = useState(false);
  const [connError, setConnError] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ── Connect socket on mount ──
  useEffect(() => {
    const token = session.getToken();

    const socket = io(AI_SERVICE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setConnError("");
    });

    socket.on("connect_error", () => {
      setConnError("Unable to connect to AI service. Please try again.");
      setConnected(false);
    });

    // ── Listen for AI triage response ──
    socket.on("TRIAGE_RESPONSE", (data: TriageResponse) => {
      if (data.type === "TRIAGE_RESPONSE") {
        setTriage(data);
        setMessages((p) => [
          ...p,
          { from: "ai", text: data.content, ts: new Date() },
        ]);

        // Show doctor/pharmacy CTAs if recommendation exists
        if (data.recommendation) {
          setEnded(true);
          onShowResults();
        }
      }
      setLoading(false);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const send = () => {
    if (!input.trim() || loading || !socketRef.current) return;

    const text = input.trim();
    setMessages((p) => [...p, { from: "user", text, ts: new Date() }]);
    setInput("");
    setLoading(true);

    const payload = {
      type: "PATIENT_MESSAGE",
      content: text,
      ...(location && { location }),
    };

    socketRef.current.emit(
      "patient-message",
      JSON.stringify(payload),
      (ack: AckResponse) => {
        // Handle callback errors from server
        if (ack?.type === "ERROR") {
          setMessages((p) => [
            ...p,
            {
              from: "ai",
              text: ack.message || "Something went wrong. Please try again.",
              ts: new Date(),
            },
          ]);
          setLoading(false);
        }
      },
    );
  };

  return (
    <Card
      style={{ display: "flex", flexDirection: "column", height: 500 }}
      p={0}
    >
      {/* Connection status bar */}
      {!connected && (
        <div
          style={{
            padding: "6px 14px",
            background: connError ? "#FEF2F2" : "#FFFBEB",
            borderBottom: `1px solid ${connError ? "#FCA5A5" : "#FDE68A"}`,
            fontSize: 12,
            color: connError ? "#EF4444" : "#F59E0B",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {connError ? <>⚠ {connError}</> : <>⏳ Connecting to AI service…</>}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            {msg.from === "ai" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: C.pl,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius:
                  msg.from === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                background: msg.from === "user" ? C.p : C.bg,
                color: msg.from === "user" ? "#fff" : C.t,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {msg.text}
            </div>
            {msg.from === "user" && <Av name={user.name} size={26} />}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: C.pl,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              🤖
            </div>
            <div
              style={{
                padding: "10px 14px",
                background: C.bg,
                borderRadius: "16px 16px 16px 4px",
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.m,
                    animation: `sp .8s ${i * 0.15}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Triage result card */}
        {triage && (
          <div
            style={{
              background: riskBg[triage.risk_level] || C.pl,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${riskColor[triage.risk_level] || C.p}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: riskColor[triage.risk_level],
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: riskColor[triage.risk_level],
                  display: "inline-block",
                }}
              />
              Risk Level: {triage.risk_level}
              {triage.recommendation?.doctor && (
                <span style={{ color: C.m, fontWeight: 400 }}>
                  · Recommended: {triage.recommendation.doctor.full_name}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {triage.recommendation && (
                <Btn sz="sm" onClick={onShowResults}>
                  View Recommended Doctors
                </Btn>
              )}
              <Btn
                sz="sm"
                v="secondary"
                onClick={() => {
                  onPharmaciesTab();
                  if (!location) onRequestLocation();
                }}
              >
                Find Nearby Pharmacies
              </Btn>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!ended && (
        <div
          style={{
            padding: 14,
            borderTop: `1px solid ${C.b}`,
            display: "flex",
            gap: 10,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Describe your symptoms…"
            disabled={!connected}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1.5px solid ${C.b}`,
              fontSize: 14,
              fontFamily: "inherit",
              background: connected ? C.bg : "#F9FAFB",
              outline: "none",
              color: C.t,
              opacity: connected ? 1 : 0.6,
            }}
          />
          <Btn onClick={send} disabled={!input.trim() || loading || !connected}>
            Send
          </Btn>
        </div>
      )}
    </Card>
  );
};
