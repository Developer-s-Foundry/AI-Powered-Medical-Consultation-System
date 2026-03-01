import { useState } from "react";
import { C } from "./Shared";
import { Card, Btn, Bdg } from "./Shared";
import { SBdg } from "./Shared";
import type { AuthUser } from "./Shared";

type NotificationsPageProps = {
  user: AuthUser;
};

const icons: Record<string, string> = {
  appointment_reminder: "📅",
  prescription_ready: "💊",
  payment_confirmed: "💳",
};

export const NotificationsPage = ({ user }: NotificationsPageProps) => {
  const [notifs, setNotifs] = useState(MOCK_DB.notifications);

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
            Notifications
          </h1>
        </div>
        <Btn
          v="ghost"
          sz="sm"
          onClick={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
        >
          Mark all read
        </Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifs.map((n: any) => (
          <Card
            key={n.id}
            style={{
              border: `1px solid ${n.read ? C.b : C.p}`,
              background: n.read ? C.s : C.pl,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 22 }}>{icons[n.type] || "🔔"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <Bdg c={C.m} bg={C.bg}>
                    {n.type}
                  </Bdg>
                  {!n.read && (
                    <Bdg c={C.d} bg={C.dl} dot>
                      unread
                    </Bdg>
                  )}
                </div>
                <div style={{ fontSize: 14 }}>{n.message}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.m,
                    fontFamily: "monospace",
                    marginTop: 4,
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <Btn
                  sz="xs"
                  v="ghost"
                  onClick={() =>
                    setNotifs((p) =>
                      p.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                    )
                  }
                >
                  Mark read
                </Btn>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Payload preview */}
      <Card style={{ marginTop: 16, background: C.bg }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
          POST /api/notifications/send — payload
        </div>
        <pre
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: C.m,
            background: C.s,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${C.b}`,
            margin: 0,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              userId: user.id,
              type: "appointment_reminder",
              message: "Your appointment is tomorrow at 10:00 AM",
              recipientType: user.role,
            },
            null,
            2,
          )}
        </pre>
      </Card>
    </div>
  );
};
