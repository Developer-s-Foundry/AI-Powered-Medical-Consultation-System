import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { session } from "../session";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════
export interface BdgProps {
  c?: string;
  bg?: string;
  dot?: boolean;
  children: ReactNode;
}

export interface BtnProps {
  onClick: () => void;
  v?: "primary" | "secondary" | "ghost" | "danger";
  sz?: "xs" | "sm" | "md" | "lg";
  children: ReactNode;
  disabled?: boolean;
  full?: boolean;
  style?: React.CSSProperties;
}

export interface InpProps {
  label?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

export interface SelectOption {
  v: string;
  l: string;
}

export interface SelProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  opts: SelectOption[];
}

export interface CardProps {
  children?: ReactNode;
  style?: React.CSSProperties;
  p?: number;
}

export interface AvProps {
  name?: string;
  size?: number;
}

export interface AlertProps {
  type?: "error" | "success";
  children?: ReactNode;
}

export interface TagProps {
  method: "GET" | "POST" | "DELETE" | "PUT";
  path: string;
}

export interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  c?: string;
  bg?: string;
}

export interface Column<T> {
  k: keyof T & string;
  r?: (row: T) => ReactNode;
}

export interface TblProps<T> {
  cols: Column<T>[];
  rows: T[];
  empty?: string;
}

export interface User {
  id: string;
  name: string;
  role: "patient" | "doctor" | "pharmacy";
}

export interface ShellProps {
  user?: User;
  page: string;
  notifCount?: number;
  children: React.ReactNode;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "pharmacy";
  isNewUser: boolean;
}

export interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
}

export interface ProfileSetupPageProps {
  user: AuthUser;
  onComplete: (profile: Profile) => void;
}

export interface Profile {
  id?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  role?: "patient" | "doctor" | "pharmacy";
}

export interface AIChatPageProps {
  user: User;
  onBook?: (doctor: string) => void;
}

export interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  phoneNumber: string;
  operatingDays: string;
  isVerified: boolean;
  lat: number;
  lng: number;
  drugs: string[];
  deliveryAvailable: boolean;
  rating: number;
  distance?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════
export const GATEWAY =
  import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080";

export const EP = {
  // ── Auth Service (via gateway)
  AUTH_REGISTER: `${GATEWAY}/api/v1/auth/users/register`,
  AUTH_LOGIN: `${GATEWAY}/api/v1/auth/users/login`,
  AUTH_GET: (id: string) => `${GATEWAY}/api/v1/auth/users/${id}`,
  AUTH_DELETE: (id: string) => `${GATEWAY}/api/v1/auth/users/delete/${id}`,
  AUTH_FORGOT: `${GATEWAY}/api/v1/auth/users/forgot-password`,
  AUTH_RESET: `${GATEWAY}/api/v1/auth/users/reset-password`,
  AUTH_VERIFY: `${GATEWAY}/api/v1/auth/users/verify-email`,
  AUTH_INIT_VERIFY: `${GATEWAY}/api/v1/auth/users/initiate-email-verification`,

  // ── Profile Service (via gateway)
  PROFILE_PATIENT: `${GATEWAY}/api/v1/profiles/patients/profile`,
  PROFILE_DOCTOR: `${GATEWAY}/api/v1/profiles/doctors/profile`,
  PROFILE_PHARMACY: `${GATEWAY}/api/v1/profiles/pharmacies/profile`,
  PROFILE_GET_PATIENT: `${GATEWAY}/api/v1/profiles/patients/profile`,
  PROFILE_GET_DOCTOR: `${GATEWAY}/api/v1/profiles/doctors/profile`,
  PROFILE_GET_PHARMACY: `${GATEWAY}/api/v1/profiles/pharmacies/profile`,
  PROFILE_GET_PATIENT_BY_ID: (id: string) =>
    `${GATEWAY}/api/v1/profiles/patients/${id}`,
  PROFILE_GET_DOCTOR_BY_ID: (id: string) =>
    `${GATEWAY}/api/v1/profiles/doctors/${id}`,
  DOCTORS_SEARCH: `${GATEWAY}/api/v1/profiles/doctors/search`,
  DOCTOR_PAYMENT_DATA: (id: string) =>
    `${GATEWAY}/api/v1/profiles/doctors/${id}/payment`,

  // ── Payment Service (via gateway)
  PAYMENT_INTENT: `${GATEWAY}/api/v1/payments/create-intent`,
  PAYMENT_WEBHOOK: `${GATEWAY}/api/v1/payments/webhooks/stripe`,

  // ── Drug Service (via gateway)
  DRUG_CREATE: `${GATEWAY}/api/v1/drugs/create`,
  DRUG_SEARCH: `${GATEWAY}/api/v1/drugs/search`,
  RX_CREATE: `${GATEWAY}/api/v1/pharm/prescription/create`,
  RX_VIEW: `${GATEWAY}/api/v1/prescription/view`,

  // ── Notification Service (via gateway)
  NOTIFY_SEND: `${GATEWAY}/api/v1/notifications/send`,

  // ── AI Service (via gateway)
  AI_CHAT: `${GATEWAY}/api/v1/ai/chat`,
  AI_SYMPTOM: `${GATEWAY}/api/v1/ai/symptom-check`,
  AI_RECOMMEND: `${GATEWAY}/api/v1/ai/recommend-doctor`,
  AI_PHARM_MATCH: `${GATEWAY}/api/v1/ai/pharmacy-match`,

  // ── Pharmacy search (via gateway)
  PHARM_NEARBY: `${GATEWAY}/api/v1/profiles/pharmacies/nearby`,
  PHARM_SEARCH: `${GATEWAY}/api/v1/profiles/pharmacies/search`,
};

// ════════════════════════════════════════════════════════════════════════════
// API CALL HELPER
// ════════════════════════════════════════════════════════════════════════════
export const call = async (url: string, method = "GET", body: any = null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = session.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || data.error || `Error ${res.status}`);
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════════════════════
export const C = {
  bg: "#F4F6FB",
  s: "#fff",
  b: "#E4E9F2",
  p: "#1A6CF6",
  pl: "#EEF3FF",
  t: "#0D1B2A",
  m: "#64748B",
  d: "#EF4444",
  dl: "#FEF2F2",
  g: "#10B981",
  gl: "#ECFDF5",
  w: "#F59E0B",
  wl: "#FFFBEB",
  pu: "#7C3AED",
  pul: "#F5F3FF",
};

// ════════════════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════
export const Bdg = ({ c = C.p, bg = C.pl, dot, children }: BdgProps) => (
  <span
    style={{
      background: bg,
      color: c,
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 9px",
      borderRadius: 20,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    }}
  >
    {dot && (
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: c }}
      />
    )}
    {children}
  </span>
);

export const SBdg = (s?: string | undefined) => {
  const m: Record<string, [string, string]> = {
    active: [C.g, C.gl],
    confirmed: [C.g, C.gl],
    paid: [C.g, C.gl],
    pending: [C.w, C.wl],
    cancelled: [C.d, C.dl],
    expired: [C.d, C.dl],
  };
  const [c, bg] = m[s?.toLowerCase() ?? ""] || [C.m, C.bg];
  return (
    <Bdg c={c} bg={bg} dot>
      {s}
    </Bdg>
  );
};

export const Btn = ({
  onClick,
  v = "primary",
  sz = "md",
  children,
  disabled,
  full,
  style: sx = {},
}: BtnProps) => {
  const sp = {
    xs: "4px 10px",
    sm: "6px 14px",
    md: "10px 20px",
    lg: "13px 28px",
  };
  const vr = {
    primary: { background: C.p, color: "#fff", border: "none" },
    secondary: { background: C.pl, color: C.p, border: "none" },
    ghost: {
      background: "transparent",
      color: C.m,
      border: `1px solid ${C.b}`,
    },
    danger: { background: C.dl, color: C.d, border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        padding: sp[sz],
        borderRadius: 8,
        fontWeight: 600,
        fontFamily: "inherit",
        fontSize: sz === "xs" ? 12 : sz === "sm" ? 13 : 14,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
        ...(full ? { width: "100%" } : {}),
        ...vr[v],
        ...sx,
      }}
    >
      {children}
    </button>
  );
};

export const Inp = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  readOnly,
}: InpProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && (
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.t,
          fontFamily: "monospace",
        }}
      >
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        padding: "9px 12px",
        borderRadius: 8,
        border: `1.5px solid ${error ? C.d : C.b}`,
        fontSize: 14,
        fontFamily: "inherit",
        background: readOnly ? C.bg : C.s,
        color: C.t,
        outline: "none",
      }}
      onFocus={(e) => !readOnly && (e.target.style.borderColor = C.p)}
      onBlur={(e) => (e.target.style.borderColor = error ? C.d : C.b)}
    />
    {error && <span style={{ fontSize: 12, color: C.d }}>{error}</span>}
  </div>
);

export const Sel = ({ label, value, onChange, opts }: SelProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && (
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.t,
          fontFamily: "monospace",
        }}
      >
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "9px 12px",
        borderRadius: 8,
        border: `1.5px solid ${C.b}`,
        fontSize: 14,
        fontFamily: "inherit",
        background: C.s,
        outline: "none",
        color: C.t,
      }}
    >
      {opts.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  </div>
);

export const Card = ({ children, style: sx = {}, p = 20 }: CardProps) => (
  <div
    style={{
      background: C.s,
      border: `1px solid ${C.b}`,
      borderRadius: 12,
      padding: p,
      ...sx,
    }}
  >
    {children}
  </div>
);

export const Av = ({ name = "?", size = 36 }: AvProps) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: C.pl,
      color: C.p,
      fontWeight: 700,
      fontSize: size * 0.36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {(name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </div>
);

export const Hr = ({ my = 16 }: { my?: number }) => (
  <div style={{ height: 1, background: C.b, margin: `${my}px 0` }} />
);

export const Alrt = ({ type = "error", children }: AlertProps) => (
  <div
    style={{
      padding: "10px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 12,
      background: type === "error" ? C.dl : C.gl,
      color: type === "error" ? C.d : C.g,
      border: `1px solid ${type === "error" ? "#FCA5A5" : "#86EFAC"}`,
    }}
  >
    {children}
  </div>
);

export const Spin = () => (
  <>
    <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    <div
      style={{
        width: 16,
        height: 16,
        border: "2px solid rgba(255,255,255,.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "sp .6s linear infinite",
      }}
    />
  </>
);

export const Tag = ({ method, path }: TagProps) => {
  const mc: Record<string, string> = {
    GET: C.g,
    POST: C.p,
    DELETE: C.d,
    PUT: C.w,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        background: C.bg,
        border: `1px solid ${C.b}`,
        borderRadius: 6,
        fontSize: 11,
        fontFamily: "monospace",
      }}
    >
      <strong style={{ color: mc[method] || C.m }}>{method}</strong>
      <span style={{ color: C.m }}>{path}</span>
    </span>
  );
};

export const StatCard = ({
  icon,
  label,
  value,
  c = C.p,
  bg = C.pl,
}: StatCardProps) => (
  <Card p={16}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        marginBottom: 8,
      }}
    >
      {icon}
    </div>
    <div style={{ fontSize: 20, fontWeight: 800, color: C.t }}>{value}</div>
    <div
      style={{
        fontSize: 11,
        color: C.m,
        marginTop: 2,
        fontFamily: "monospace",
      }}
    >
      {label}
    </div>
  </Card>
);

export const Tbl = <T,>({
  cols,
  rows,
  empty = "No records yet",
}: TblProps<T>) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${C.b}` }}>
          {cols.map((c) => (
            <th
              key={c.k}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: C.m,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}
            >
              {c.k}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={cols.length}>
              <div
                style={{
                  textAlign: "center",
                  padding: 32,
                  color: C.m,
                  fontSize: 13,
                }}
              >
                {empty}
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.b}` }}>
              {cols.map((c) => (
                <td
                  key={c.k}
                  style={{
                    padding: "11px 12px",
                    fontSize: 13,
                    verticalAlign: "middle",
                  }}
                >
                  {c.r ? c.r(row) : String(row[c.k as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// SHELL
// ════════════════════════════════════════════════════════════════════════════
export const Shell: React.FC<ShellProps> = ({
  user,
  page,
  notifCount = 0,
  children,
}) => {
  const navigate = useNavigate();
  const pNav = [
    { id: "patient-dashboard", l: "Profile" },
    { id: "find-doctors", l: "Find Doctors" },
    { id: "appointments", l: "Appointments" },
    { id: "prescriptions-patient", l: "Prescriptions" },
    { id: "payments", l: "Payments" },
    { id: "ai-chat", l: "🤖 AI Chat" },
  ];
  const dNav = [
    { id: "doctor-dashboard", l: "Dashboard" },
    { id: "prescriptions-doctor", l: "Prescriptions" },
    { id: "doctor-payments", l: "Payments" },
  ];
  const phNav = [
    { id: "pharmacy-dashboard", l: "Dashboard" },
    { id: "manage-drugs", l: "Drugs" },
    { id: "rx-queue", l: "Rx Queue" },
  ];
  const nav =
    user?.role === "doctor" ? dNav : user?.role === "pharmacy" ? phNav : pNav;
  const roleColor: Record<string, string> = {
    doctor: C.pu,
    pharmacy: C.w,
    patient: C.p,
  };
  const roleBg: Record<string, string> = {
    doctor: C.pul,
    pharmacy: C.wl,
    patient: C.pl,
  };
  const role = user?.role ?? "patient";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: C.s,
          borderBottom: `1px solid ${C.b}`,
          padding: "0 24px",
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: 17,
              color: C.p,
              letterSpacing: -0.5,
            }}
          >
            HealthBridge
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => navigate(`/${n.id}`)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: page === n.id ? 700 : 500,
                  color: page === n.id ? C.p : C.m,
                  background: page === n.id ? C.pl : "transparent",
                  fontFamily: "inherit",
                }}
              >
                {n.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              padding: 4,
            }}
          >
            🔔
            {notifCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: C.d,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notifCount}
              </span>
            )}
          </button>
          <Bdg c={roleColor[role]} bg={roleBg[role]}>
            {role}
          </Bdg>
          <Av name={user?.name || "U"} size={28} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.t }}>
            {user?.name}
          </span>
          <Btn
            v="ghost"
            sz="sm"
            onClick={() => {
              session.clear();
              localStorage.removeItem("user");
              localStorage.removeItem("profile");
              navigate("/login");
            }}
          >
            Logout
          </Btn>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {children}
      </div>
    </div>
  );
};
