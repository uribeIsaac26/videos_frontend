import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { AccionDuplicado, GrupoDuplicado, MiembroDuplicado } from "../types/VideoDuplicate";
import { getGruposDuplicados, getGrupoDuplicado } from "../api/VideoDuplicateApi";
import DuplicadoCard from "../components/DuplicadoCard";
import UserMenu from "../components/UserMenu";

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

function MemberThumb({ thumbnailUrl }: { thumbnailUrl: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    fetch(`${API_URL}${thumbnailUrl}`, { credentials: "include" })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnailUrl]);

  return src ? (
    <img className="thumbnail" src={src} alt="" />
  ) : (
    <div className="thumbnail-placeholder">Cargando...</div>
  );
}

function DuplicadosPage() {
  const [grupos, setGrupos] = useState<GrupoDuplicado[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoDuplicado | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(searchParams.get("page")) || 0;

  useEffect(() => {
    fetchGrupos(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const fetchGrupos = async (currentPage: number) => {
    try {
      const data = await getGruposDuplicados(currentPage, 20);
      setGrupos(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error cargando grupos de duplicados", error);
    }
  };

  const handleCardClick = async (id: number) => {
    setLoadingDetail(true);
    try {
      const detail = await getGrupoDuplicado(id);
      setSelectedGrupo(detail);
    } catch (error) {
      console.error("Error cargando detalle del grupo", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMemberClick = (member: MiembroDuplicado, index: number) => {
    if (!selectedGrupo?.members) return;
    navigate(`/videos/${member.video.id}`, {
      state: {
        videos: selectedGrupo.members.map((m) => ({
          id: m.video.id,
          title: m.video.title,
          tags: [],
        })),
        index,
        fromDuplicados: true,
      },
    });
  };

  return (
    <div className="page-container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Videos Duplicados</h1>
        <UserMenu />
      </header>

      <div className="pagination-container">
        <button
          className="pagination-button"
          disabled={page === 0}
          onClick={() => setSearchParams({ page: (page - 1).toString() })}
        >
          ◀ Anterior
        </button>
        <span className="pagination-info">
          Página {page + 1} de {totalPages || 1}
        </span>
        <button
          className="pagination-button"
          disabled={page + 1 >= totalPages}
          onClick={() => setSearchParams({ page: (page + 1).toString() })}
        >
          Siguiente ▶
        </button>
      </div>

      {grupos.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>
          No hay grupos de duplicados.
        </p>
      ) : (
        <div className="duplicado-grid">
          {grupos.map((grupo) => (
            <DuplicadoCard
              key={grupo.id}
              grupo={grupo}
              onClick={() => handleCardClick(grupo.id)}
            />
          ))}
        </div>
      )}

      {loadingDetail && (
        <div className="modal-overlay">
          <p style={{ color: "white" }}>Cargando detalle...</p>
        </div>
      )}

      {selectedGrupo && !loadingDetail && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedGrupo(null);
          }}
        >
          <div className="tag-modal duplicado-detail-modal">
            <div className="duplicado-detail-header">
              <div>
                <h2 style={{ margin: 0 }}>{selectedGrupo.tagOrigen}</h2>
                <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.85rem" }}>
                  {selectedGrupo.totalMembers} videos •{" "}
                  {new Date(selectedGrupo.dateCreation).toLocaleDateString("es-CO")}
                </p>
              </div>
              <button className="back-button" onClick={() => setSelectedGrupo(null)}>
                ✕ Cerrar
              </button>
            </div>

            <div className="duplicado-detail-grid">
              {selectedGrupo.members?.map((member, index) => (
                <div
                  key={member.id}
                  className="miembro-card"
                  onClick={() => handleMemberClick(member, index)}
                >
                  <div className="thumbnail-container">
                    <MemberThumb thumbnailUrl={member.video.thumbnailUrl} />
                  </div>
                  <div className="miembro-info">
                    <span className="miembro-title">{member.video.title}</span>
                    <div className="miembro-badges">
                      <span className="similitud-badge">
                        {(member.similitud * 100).toFixed(0)}% similitud
                      </span>
                      <span
                        className="accion-badge"
                        style={{ backgroundColor: ACCION_COLORS[member.accion] }}
                      >
                        {ACCION_LABELS[member.accion]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DuplicadosPage;
