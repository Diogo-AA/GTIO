import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/client";

interface Voto {
  gala?: { nombre?: string; id?: number };
  candidato?: { nombre?: string; id?: number };
  fecha?: string;
}

interface UsuarioDetalle {
  id: number;
  username: string;
  votos: Voto[];
}

interface Props {
  userId: number;
  onClose: () => void;
}

export default function UsuarioModal({ userId, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<UsuarioDetalle>(`usuarios/${userId}`);
        setUsuario(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <div
      className="modal-overlay open"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          {t("common.cerrar")}
        </button>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>{t("modal.cargando")}</p>
          </div>
        )}

        {!loading && error && <p style={{ color: "var(--red)" }}>{error}</p>}

        {!loading && !error && usuario && (
          <>
            <h3>{usuario.username}</h3>
            <p
              style={{
                color: "var(--gray-400)",
                fontSize: ".85rem",
                marginBottom: "1rem",
              }}
            >
              ID: {usuario.id} ·{" "}
              {t("modal.votosEmitidos", { n: usuario.votos.length })}
            </p>
            {usuario.votos.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("modal.gala")}</th>
                      <th>{t("modal.candidato")}</th>
                      <th>{t("modal.fecha")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuario.votos.map((v, idx) => (
                      <tr key={idx}>
                        <td>{v.gala?.nombre || v.gala?.id || ""}</td>
                        <td>{v.candidato?.nombre || v.candidato?.id || ""}</td>
                        <td>
                          {v.fecha
                            ? new Date(v.fecha).toLocaleDateString(
                                i18n.language,
                              )
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "var(--gray-400)" }}>{t("modal.sinVotos")}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
