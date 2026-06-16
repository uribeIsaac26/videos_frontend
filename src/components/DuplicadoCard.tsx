import { useEffect, useState } from "react";
import type { AccionDuplicado, GrupoDuplicado } from "../types/VideoDuplicate";

const API_URL = import.meta.env.VITE_API_URL;

const ACCION_LABELS: Record<AccionDuplicado, string> = {
  PENDIENTE: "Pendiente",
  ES_DUPLICADO: "Duplicado",
  NO_ES_DUPLICADO: "No duplicado",
};

const ACCION_COLORS: Record<AccionDuplicado, string> = {
  PENDIENTE: "#f0a500",
  ES_DUPLICADO: "#e74c3c",
  NO_ES_DUPLICADO: "#2ecc71",
};

interface Props {
  grupo: GrupoDuplicado;
  onClick: () => void;
}

function DuplicadoCard({ grupo, onClick }: Props) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!grupo.preview) return;
    let objectUrl: string | null = null;
    fetch(`${API_URL}${grupo.preview.video.thumbnailUrl}`, { credentials: "include" })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setThumbnailSrc(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [grupo.preview?.video.id]);

  const accion = grupo.preview?.accion ?? "PENDIENTE";

  return (
    <div className="duplicado-card" onClick={onClick}>
      <div className="thumbnail-container">
        {thumbnailSrc ? (
          <img className="thumbnail" src={thumbnailSrc} alt={grupo.preview?.video.title} />
        ) : (
          <div className="thumbnail-placeholder">Cargando...</div>
        )}
      </div>

      <div className="duplicado-card-info">
        <span className="duplicado-tag-origen">{grupo.tagOrigen}</span>
        <span
          className="accion-badge"
          style={{ backgroundColor: ACCION_COLORS[accion] }}
        >
          {ACCION_LABELS[accion]}
        </span>
      </div>

      <div className="duplicado-card-meta">
        <span>{grupo.totalMembers} videos</span>
        <span>{new Date(grupo.dateCreation).toLocaleDateString("es-CO")}</span>
      </div>
    </div>
  );
}

export default DuplicadoCard;
