import Billing from "./pages/Billing";
import { useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  Activity,
  Brain,
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  ReceiptText,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import PatientFlow from "./pages/PatientFlow";
import ClinicalRisk from "./pages/ClinicalRisk";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";

// ============================================================
// ROLE PERMISSIONS
// ============================================================

const ROLE_PERMISSIONS = {
  Administrator: ["/", "/flow", "/risk", "/patients", "/billing"],
  "Hospital Staff": ["/", "/flow", "/risk", "/patients"],
  Management: ["/", "/flow", "/risk", "/billing"],
};

// ============================================================
// NAVIGATION ITEMS
// ============================================================

const NAVIGATION = [
  {
    label: "Executive Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
  label: "Billing BI",
  path: "/billing",
  icon: ReceiptText,
  },
  {
    label: "Patient Flow & LOS",
    path: "/flow",
    icon: Activity,
  },
  {
    label: "Clinical Risk & Prediction",
    path: "/risk",
    icon: Brain,
  },
  {
    label: "Patient Directory",
    path: "/patients",
    icon: Users,
  },
];

// ============================================================
// PAGE TITLES
// ============================================================

const PAGE_TITLES = {
  "/": "Executive BI Dashboard",
  "/flow": "Patient Flow & LOS",
  "/risk": "Clinical Risk & Prediction",
  "/patients": "Patient Directory",
  "/billing": "Billing BI",
};

// ============================================================
// PROTECTED PATIENT DETAIL
// ============================================================

function ProtectedPatientDetail({ role }) {
  const canViewPatients =
    role === "Administrator" ||
    role === "Hospital Staff";

  if (!canViewPatients) {
    return <Navigate to="/" replace />;
  }

  return <PatientDetail />;
}

// ============================================================
// MAIN APPLICATION
// ============================================================

export default function App() {
  const [role, setRole] = useState("Administrator");

  const location = useLocation();

  const allowedRoutes = ROLE_PERMISSIONS[role] || [];

  function canAccess(path) {
    return allowedRoutes.includes(path);
  }

  const currentTitle =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/patients/")
      ? "Patient Record Detail"
      : "St. Hubert Medical Center");

  return (
    <div className="app-shell">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">
          <div className="brand-icon">
            <Building2 size={21} />
          </div>

          <div>
            <strong>ST. HUBERT</strong>
            <span>MEDICAL CENTER</span>
          </div>
        </div>

        {/* NAVIGATION LABEL */}

        <p className="side-caption">
          BUSINESS INTELLIGENCE
        </p>

        {/* NAVIGATION LINKS */}

        <nav>
          {NAVIGATION
            .filter((item) => canAccess(item.path))
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-bottom">
          <div>
            <span className="status-dot" />
            System connected
          </div>

          <small>St. Hubert BI Platform</small>
        </div>

      </aside>

      {/* ==================================================
          MAIN AREA
      ================================================== */}

      <div className="main-area">

        {/* TOP NAVIGATION */}

        <header className="topbar">

          <div>
            <span className="topbar-kicker">
              ST. HUBERT MEDICAL CENTER
            </span>

            <strong className="topbar-title">
              {currentTitle}
            </strong>
          </div>

          <div className="role-selector-container">

            <span className="role-selector-label">
              DEMO ROLE
            </span>

            <UserCircle
              size={18}
              color="#548675"
            />

            <select
              className="role-selector"
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              aria-label="Select demonstration role"
            >
              <option value="Administrator">
                Administrator
              </option>

              <option value="Hospital Staff">
                Hospital Staff
              </option>

              <option value="Management">
                Management
              </option>
            </select>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="content">

          <Routes>

            {/* EXECUTIVE DASHBOARD */}

            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* PATIENT FLOW */}

            <Route
              path="/flow"
              element={
                canAccess("/flow")
                  ? <PatientFlow />
                  : <Navigate to="/" replace />
              }
            />

            {/* CLINICAL RISK */}

            <Route
              path="/risk"
              element={
                canAccess("/risk")
                  ? <ClinicalRisk />
                  : <Navigate to="/" replace />
              }
            />

            {/* PATIENT DIRECTORY */}

            <Route
              path="/patients"
              element={
                canAccess("/patients")
                  ? <Patients role={role} />
                  : <Navigate to="/" replace />
              }
            />

            {/* PATIENT RECORD DETAIL */}

            <Route
              path="/patients/:patientId"
              element={
                <ProtectedPatientDetail role={role} />
              }
            />

            {/* BILLING */}

            <Route
              path="/billing"
              element={
                canAccess("/billing")
                  ? <Billing />
                  : <Navigate to="/" replace />
              }
            />

            {/* UNKNOWN ROUTES */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}
