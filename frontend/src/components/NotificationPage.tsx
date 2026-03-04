import { useState, useEffect } from "react";
import { C } from "./Shared";
import { EP } from "../config";
import { call } from "../api";
import { Card, Btn, Bdg, Spin } from "./Shared";
import type { AuthUser } from "./Shared";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type NotificationsPageProps = {
  user: AuthUser;
};

const icons: Record<string, string> = {
  appointment_reminder: "📅",
  appointment_confirmed: "✅",
  appointment_cancelled: "❌",
  prescription_ready: "💊",
  prescription_issued: "📋",
  payment_confirmed: "💳",
};

export const NotificationsPage = ({ user }: NotificationsPageProps) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    call(EP.NOTIFICATIONS(user.id))
      .then((r) => {
        const rows = r.data?.rows || r.rows || r.data || [];
        setNotifs(rows);
      })
      .catch(() => setErr("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, [user.id]);

  const markRead = (id: string) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const unreadCount = notifs.filter((n) => !n.read).length;

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.t }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Bdg c={C.d} bg={C.dl} dot>
              {unreadCount} unread
            </Bdg>
          )}
        </div>
        {unreadCount > 0 && (
          <Btn v="ghost" sz="sm" onClick={markAllRead}>
            Mark all read
          </Btn>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : err ? (
        <Card style={{ textAlign: "center", color: C.d }} p={32}>
          {err}
        </Card>
      ) : notifs.length === 0 ? (
        <Card style={{ textAlign: "center" }} p={40}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
          <div style={{ fontWeight: 700, color: C.t, marginBottom: 4 }}>
            No notifications yet
          </div>
          <div style={{ fontSize: 13, color: C.m }}>
            You'll be notified here about appointments, prescriptions, and
            payments.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map((n) => (
            <Card
              key={n.id}
              style={{
                border: `1px solid ${n.read ? C.b : C.p}`,
                background: n.read ? C.s : C.pl,
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
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
                  {n.title && (
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.t,
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: C.t }}>{n.body}</div>
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
                  <Btn sz="xs" v="ghost" onClick={() => markRead(n.id)}>
                    Mark read
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
