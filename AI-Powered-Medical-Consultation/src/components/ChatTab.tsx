import { useRef, useEffect, useState } from "react";
import { C, EP } from "./Shared";
import { call } from "./Shared";
import { Card, Btn, Av } from "./Shared";
import type { Coords } from "./UseLocation";

type Message = { from: "ai" | "user"; text: string; ts: Date };

type ChatTabProps = {
  user: { id: string; name: string };
  location: Coords | null;
  onShowResults: () => void;
  onRequestLocation: () => void;
  onPharmaciesTab: () => void;
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
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const [showResults, setShowResults] = useState(false);
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    setMessages((p) => [...p, { from: "user", text: input, ts: new Date() }]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      let aiText: string;
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 900));
        const userMsgCount = messages.filter((m) => m.from === "user").length;
        const mockFlow = [
          "I understand. How long have you been experiencing these symptoms? Any fever, shortness of breath, or chest pain?",
          "Thank you. Do you have any existing medical conditions or known drug allergies? Are you currently on any medication?",
          "Got it. Based on what you've described, I recommend seeing a specialist. I've also found pharmacies near you that stock commonly prescribed drugs for this condition. Use the tabs below to explore your options.",
        ];
        aiText =
          mockFlow[userMsgCount] ||
          "I've reviewed your symptoms. Please check the Doctors and Pharmacies tabs below.";
        if (userMsgCount >= 2) {
          setShowResults(true);
          setEnded(true);
          onShowResults();
        }
      } else {
        const body = {
          message: currentInput,
          sessionId,
          userId: user.id,
          ...(location && { location }),
        };
        const res = await call(EP.AI_CHAT, "POST", body);
        aiText =
          res.reply ||
          res.data?.reply ||
          "I'm here to help. Can you tell me more?";
        if (res.recommendDoctors || res.showResults) {
          setShowResults(true);
          setEnded(true);
          onShowResults();
        }
      }
      setMessages((p) => [...p, { from: "ai", text: aiText, ts: new Date() }]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          from: "ai",
          text: "I'm having trouble responding right now. Please try again shortly.",
          ts: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <Card
      style={{ display: "flex", flexDirection: "column", height: 500 }}
      p={0}
    >
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

        {showResults && (
          <div
            style={{
              background: C.pl,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.p}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.p,
                marginBottom: 8,
              }}
            >
              AI has finished your assessment
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn sz="sm" onClick={onShowResults}>
                View Recommended Doctors
              </Btn>
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
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1.5px solid ${C.b}`,
              fontSize: 14,
              fontFamily: "inherit",
              background: C.bg,
              outline: "none",
              color: C.t,
            }}
          />
          <Btn onClick={send} disabled={!input.trim() || loading}>
            Send
          </Btn>
        </div>
      )}
    </Card>
  );
};
