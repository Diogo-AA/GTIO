import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/client";
import { showToast } from "../services/toastService";

interface Candidato {
  id: number;
  nombre: string;
  numVotos: number;
}

interface Gala {
  id: number;
  nombre: string;
  fecha: string;
  candidatos: Candidato[];
}

export default function VotarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [gala, setGala] = useState<Gala | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votando, setVotando] = useState<number | null>(null);
  const [haVotado, setHaVotado] = useState(false);

  const loadGala = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Gala>(`galas/${id}`);
      setGala(data);
    } catch (err: unknown) {
      setError((err as Error).message);
      showToast(t("votar.errorCargar"), "error");
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadGala();
  }, [loadGala]);

  async function submitVoto(candidatoId: number) {
    if (!gala) return;
    setVotando(candidatoId);
    try {
      await apiFetch("votos", {
        method: "POST",
        body: JSON.stringify({ idCandidato: candidatoId, idGala: gala.id }),
      });
      showToast(t("votar.votoRegistrado"), "success");
      setHaVotado(true);
      await loadGala();
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    } finally {
      setVotando(null);
    }
  }

  if (loading)
    return (
      <div className="container">
        <div className="loading-state">
          <div className="spinner" />
          <p>{t("common.cargando")}</p>
        </div>
      </div>
    );

  if (error || !gala)
    return (
      <div className="container">
        <div className="empty-state">
          <h3>{t("common.error")}</h3>
          <p style={{ color: "var(--red)" }}>{error}</p>
        </div>
      </div>
    );

  const totalVotos = (gala.candidatos || []).reduce(
    (s, c) => s + (c.numVotos || 0),
    0,
  );
  const fecha = gala.fecha
    ? new Date(gala.fecha).toLocaleDateString(i18n.language, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const sorted = [...(gala.candidatos || [])].sort(
    (a, b) => b.numVotos - a.numVotos,
  );

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: ".75rem" }}>
        <div>
          <div className="section-title" style={{ marginBottom: ".1rem" }}>
            {gala.nombre}
          </div>
          <div style={{ fontSize: ".83rem", color: "var(--gray-400)" }}>
            {fecha} · {t("votar.votosTotales", { n: totalVotos })}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/galas")}
        >
          {t("votar.volver")}
        </button>
      </div>

      <div className="box">
        <div className="section-title" style={{ marginBottom: ".75rem" }}>
          {t("votar.candidatos")}
        </div>
        {(gala.candidatos || []).map((c, idx) => {
          const pct =
            totalVotos > 0 ? Math.round((c.numVotos / totalVotos) * 100) : 0;
          return (
            <div
              key={c.id}
              className="candidato-row"
              style={{
                borderBottom:
                  idx === gala.candidatos.length - 1 ? "none" : undefined,
              }}
            >
              <div className="candidato-foto">{t("votar.foto")}</div>
              <div className="candidato-nombre">{c.nombre}</div>
              <div style={{ flex: 1, minWidth: 80 }}>
                <div className="candidato-votos-label">
                  {t("galas.votos", { n: c.numVotos })} · {pct}%
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={haVotado || votando === c.id}
                onClick={() => submitVoto(c.id)}
              >
                {votando === c.id ? t("votar.votando") : t("votar.votar")}
              </button>
            </div>
          );
        })}
      </div>

      <div className="box" style={{ marginTop: ".5rem" }}>
        <div className="section-title" style={{ marginBottom: ".75rem" }}>
          {t("votar.resultados")}
        </div>
        {sorted.map((c) => {
          const pct =
            totalVotos > 0 ? Math.round((c.numVotos / totalVotos) * 100) : 0;
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".75rem",
                marginBottom: ".75rem",
              }}
            >
              <div
                style={{
                  width: 130,
                  fontSize: ".85rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c.nombre}
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-bg" style={{ maxWidth: "100%" }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div
                style={{
                  width: 80,
                  fontSize: ".8rem",
                  color: "var(--gray-400)",
                  textAlign: "right",
                }}
              >
                {c.numVotos} ({pct}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
