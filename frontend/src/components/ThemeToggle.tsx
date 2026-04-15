import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getCurrentTheme, toggleTheme } from "../services/themeServices";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState(getCurrentTheme);

  function handleToggle() {
    toggleTheme();
    setTheme(getCurrentTheme());
  }

  const label =
    theme === "dark"
      ? t("common.activarModoClaro")
      : t("common.activarModoOscuro");

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={handleToggle}
      title={label}
      aria-label={label}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
