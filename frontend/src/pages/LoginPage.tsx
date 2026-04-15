import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 55px)",
        padding: "2rem 1rem",
      }}
    >
      <div className="login-box">
        <h2>{t("login.titulo")}</h2>
        <hr className="divider" />
        <button className="btn btn-primary btn-full" onClick={login}>
          {t("login.entrar")}
        </button>
      </div>
    </div>
  );
}
