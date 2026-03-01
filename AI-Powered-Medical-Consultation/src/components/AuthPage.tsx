import { useState } from "react";
import type { AuthPageProps, AuthUser } from "./Shared";
import { C, EP, GATEWAY } from "./Shared";
import { session } from "../session";
import { call } from "./Shared";
import { Card, Inp, Btn, Alrt, Spin, Tag } from "./Shared";

type AuthAction = "login" | "register" | "forgot" | "reset";

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthUser["role"]>("patient");
  const [rToken, setRToken] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const go = async (action: AuthAction) => {
    setErr("");
    setOk("");
    setLoading(true);

    try {
      if (action === "login") {
        const res = await call(EP.AUTH_LOGIN, "POST", { email, password });
        console.log("LOGIN RESPONSE:", JSON.stringify(res, null, 2));
        if (res.accessToken) session.setToken(res.accessToken);
        onLogin({
          id: res.id,
          name: email.split("@")[0],
          email,
          role: res.user.role as AuthUser["role"],
          isNewUser: false,
        });
      } else if (action === "register") {
        const res = await call(EP.AUTH_REGISTER, "POST", {
          email,
          password,
          role,
        });
        console.log("REGISTER RESPONSE:", JSON.stringify(res, null, 2));
        if (!res.accessToken) throw new Error("No token returned from server");
        session.setToken(res.accessToken);
        onLogin({
          id: res.id,
          name: email.split("@")[0],
          email,
          role: role as AuthUser["role"],
          isNewUser: true,
        });
      } else if (action === "forgot") {
        try {
          await call(EP.AUTH_FORGOT, "POST", { email });
        } catch (_e) {
          // Security: show same message regardless
        }
        setOk("If that email exists, a reset link has been sent.");
      } else if (action === "reset") {
        await call(EP.AUTH_RESET, "POST", {
          email,
          newPassword: newPwd,
          token: rToken,
        });
        setOk("Password reset! You can now sign in.");
        setTimeout(() => setTab("login"), 1500);
      }
    } catch (e: any) {
      setErr(e.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${C.pl} 0%, ${C.bg} 60%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <Card style={{ width: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 26,
              color: C.p,
              letterSpacing: -0.5,
            }}
          >
            HealthBridge
          </div>
          <div style={{ color: C.m, fontSize: 13 }}>
            AI-Powered Medical Consultation
          </div>
        </div>

        {(tab === "login" || tab === "register") && (
          <div
            style={{
              display: "flex",
              background: C.bg,
              borderRadius: 8,
              padding: 4,
              marginBottom: 20,
              gap: 3,
            }}
          >
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setErr("");
                }}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: tab === t ? 700 : 500,
                  fontSize: 13,
                  color: tab === t ? C.p : C.m,
                  background: tab === t ? C.s : "transparent",
                  fontFamily: "inherit",
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        )}

        {(tab === "forgot" || tab === "reset") && (
          <button
            onClick={() => setTab("login")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: C.m,
              fontFamily: "inherit",
              marginBottom: 14,
            }}
          >
            ← Back to Sign In
          </button>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp
            label="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          {(tab === "login" || tab === "register") && (
            <Inp
              label="password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min 8 characters"
            />
          )}

          {tab === "reset" && (
            <>
              <Inp
                label="token (from email)"
                value={rToken}
                onChange={setRToken}
                placeholder="Paste reset token"
              />
              <Inp
                label="newPassword"
                type="password"
                value={newPwd}
                onChange={setNewPwd}
                placeholder="New password"
              />
            </>
          )}

          {tab === "register" && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.t,
                  fontFamily: "monospace",
                  marginBottom: 8,
                }}
              >
                role
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {(["patient", "doctor", "pharmacy"] as AuthUser["role"][]).map(
                  (r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: "9px 4px",
                        borderRadius: 8,
                        border: `1.5px solid ${role === r ? C.p : C.b}`,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: role === r ? 700 : 400,
                        color: role === r ? C.p : C.m,
                        background: role === r ? C.pl : C.s,
                        fontFamily: "inherit",
                      }}
                    >
                      {r}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {err && <Alrt>{err}</Alrt>}
          {ok && <Alrt type="success">{ok}</Alrt>}

          <Btn
            full
            sz="lg"
            disabled={
              loading ||
              !email ||
              (tab !== "forgot" && !password && tab !== "reset")
            }
            onClick={() => go(tab as AuthAction)}
          >
            {loading ? (
              <Spin />
            ) : tab === "login" ? (
              "Sign In"
            ) : tab === "register" ? (
              "Create Account"
            ) : tab === "forgot" ? (
              "Send Reset Link"
            ) : (
              "Reset Password"
            )}
          </Btn>

          {tab === "login" && (
            <button
              onClick={() => {
                setTab("forgot");
                setErr("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: C.p,
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              Forgot password?
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "10px 12px",
            background: C.bg,
            borderRadius: 8,
            fontSize: 11,
            color: C.m,
          }}
        >
          <div>
            <strong>API Gateway:</strong> {GATEWAY}
          </div>
          <div style={{ marginTop: 3 }}>
            Routes via gateway → auth · profile · payment · drug · AI ·
            notifications
          </div>
        </div>
      </Card>
    </div>
  );
};
