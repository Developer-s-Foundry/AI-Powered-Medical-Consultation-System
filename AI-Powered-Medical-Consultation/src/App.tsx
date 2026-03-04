import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

// All your components from the barrel
import {
  AuthPage,
  ProfileSetupPage,
  PatientProfilePage,
  FindDoctorsPage,
  AppointmentsPage,
  PatientRxPage,
  PaymentsPage,
  DoctorDashboard,
  DoctorRxPage,
  DoctorPaymentsPage,
  PharmacyDashboard,
  ManageDrugsPage,
  RxQueuePage,
  NotificationsPage,
  AIChatPage,
} from "./components";

// Your existing shell, constants, types, utils
import { Shell } from "./components/Shared";
import { C, EP } from "./components/Shared";
import { call } from "./components/Shared";
import type { AuthUser, Profile } from "./types";

// ════════════════════════════════════════════════════════════════════════════
// APP ROOT
// Flow:
//   Register  → ProfileSetupPage (always, profile=null)
//   Login     → tries to fetch profile from backend
//               if USE_MOCK and no profile yet → also shows ProfileSetupPage
//   Profile created → navigate to role dashboard
// ════════════════════════════════════════════════════════════════════════════
//  1. Move `home` to module level (outside everything)
const home: Record<string, string> = {
  doctor: "/doctor-dashboard",
  pharmacy: "/pharmacy-dashboard",
  patient: "/patient-dashboard",
};

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const s = localStorage.getItem("profile");
    return s ? JSON.parse(s) : null;
  });

  const [loadingProfile, setLoadingProfile] = useState(false);

  const onLogin = async (
    u: AuthUser,
    navigate: (path: string, option?: any) => void,
  ) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);

    if (u.isNewUser) {
      setProfile(null);
      navigate("/profile-setup");
      return;
    }

    setLoadingProfile(true);

    try {
      let fetched: Profile | null = null;
      if (u.role === "patient") {
        const r = await call(EP.PROFILE_GET_PATIENT);
        console.log("RAW RESPONSE:", JSON.stringify(r, null, 2));
        fetched = r.data || r;
        console.log("FETCHED:", JSON.stringify(fetched, null, 2));
      } else if (u.role === "doctor") {
        const r = await call(EP.PROFILE_GET_DOCTOR);
        console.log("DOCTOR PROFILE RAW:", JSON.stringify(r, null, 2));
        fetched = r.data || r;
        console.log("DOCTOR FETCHED:", JSON.stringify(fetched, null, 2));
      } else if (u.role === "pharmacy") {
        const r = await call(EP.PROFILE_GET_PHARMACY);
        fetched = r.data || r;
      }

      setProfile(fetched);
      console.log("PROFILE SET TO:", fetched);
      localStorage.setItem("profile", JSON.stringify(fetched));

      // 3. Only one navigate call, using module-level `home`
      navigate(home[u.role] || "/patient-dashboard", { replace: true });
    } catch (e: any) {
      console.log("Profile fetch error:", e.message);
      setProfile(null);
      navigate("/profile-setup");
    } finally {
      setLoadingProfile(false);
    }
  };

  // onProfileComplete also uses module-level `home` now
  const onProfileComplete = (
    prof: Profile,
    navigate: (path: string, options?: { replace?: boolean }) => void,
  ) => {
    setProfile(prof);
    localStorage.setItem("profile", JSON.stringify(prof)); //  persist it too
    navigate(home[user?.role ?? "patient"] || "/patient-dashboard", {
      replace: true,
    });
  };

  // ... rest unchanged
  // WRAPPER COMPONENT FOR LOGIN PAGE
  function LoginWrapper() {
    const navigate = useNavigate();
    return <AuthPage onLogin={(u) => onLogin(u, navigate)} />;
  }

  // WRAPPER COMPONENT FOR PROFILE SETUP PAGE
  function ProfileSetupWrapper() {
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" replace />;

    return profile ? (
      <Navigate to={`/${user.role}-dashboard`} replace />
    ) : (
      <ProfileSetupPage
        user={user}
        onComplete={(p) => onProfileComplete(p, navigate)}
      />
    );
  }
  if (loadingProfile)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          color: "#64748B",
        }}
      >
        Loading your profile…
      </div>
    );

  return (
    <Router>
      <Routes>
        {/* Public routes — no Shell */}
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/profile-setup" element={<ProfileSetupWrapper />} />

        {/* Protected routes — with Shell */}
        <Route
          path="/patient-dashboard"
          element={
            user && profile ? (
              <Shell user={user} notifCount={0}>
                <PatientProfilePage user={user} profile={profile} />
              </Shell>
            ) : (
              <Navigate to={user ? "/profile-setup" : "/login"} />
            )
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            user && profile ? (
              <Shell user={user} notifCount={0}>
                <DoctorDashboard user={user} profile={profile} />
              </Shell>
            ) : (
              <Navigate to={user ? "/profile-setup" : "/login"} />
            )
          }
        />
        <Route
          path="/pharmacy-dashboard"
          element={
            user && profile ? (
              <Shell user={user} notifCount={0}>
                <PharmacyDashboard user={user} profile={profile} />
              </Shell>
            ) : (
              <Navigate to={user ? "/profile-setup" : "/login"} />
            )
          }
        />
        <Route
          path="/find-doctors"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <FindDoctorsPage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/appointments"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <AppointmentsPage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/ai-chat"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <AIChatPage user={user} onBook={() => {}} />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/payments"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <PaymentsPage user={user} />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <NotificationsPage user={user} />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/prescriptions-patient"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <PatientRxPage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/prescriptions-doctor"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <DoctorRxPage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/doctor-payments"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <DoctorPaymentsPage user={user} />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/manage-drugs"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <ManageDrugsPage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/rx-queue"
          element={
            user ? (
              <Shell user={user} notifCount={0}>
                <RxQueuePage />
              </Shell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate to={user ? `/${user.role}-dashboard` : "/login"} />
          }
        />
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", padding: 60, color: C.m }}>
              Page not found
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
