import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { showToast } from "../services/toastService";
import LangSwitcher from "./LangSwitcher";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { path: "/galas", label: "nav.galas", role: null },
  { path: "/usuarios", label: "nav.usuarios", role: "admin" },
  { path: "/perfil", label: "nav.perfil", role: null },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();

  async function handleLogout() {
    showToast(t("perfil.sesionCerrada"), "info");
    await logout();
  }

  const visibleLinks = NAV_LINKS.filter(
    (link) => link.role === null || user?.roles.includes(link.role),
  );

  return (
    <nav>
      <div
        className="nav-brand"
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onClick={() => navigate(isAuthenticated ? "/galas" : "/login")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            navigate(isAuthenticated ? "/galas" : "/login");
        }}
      >
        {t("nav.brand")}
      </div>

      {isAuthenticated && (
        <div className="nav-links">
          {visibleLinks.map((link) => (
            <button
              key={link.path}
              className={`tab${location.pathname.startsWith(link.path) ? " active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              {t(link.label)}
            </button>
          ))}
        </div>
      )}

      <div id="nav-actions">
        <LangSwitcher />
        <ThemeToggle />
        {isAuthenticated && user ? (
          <>
            <div className="user-chip">
              <div className="av">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span>{user.username}</span>
            </div>
            <span className="estado-chip">{t("nav.conectado")}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              {t("nav.salir")}
            </button>
          </>
        ) : (
          <>
            <span className="estado-chip offline">{t("nav.desconectado")}</span>
            {location.pathname !== "/login" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/login")}
              >
                {t("nav.iniciarSesion")}
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
