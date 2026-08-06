import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { getMangaById, getMangaPaginas } from "../api/MangaApi";
import type { MangaDetail, MangaPagina, MangaTag } from "../types/Manga";
import MangaPageThumbnail from "../components/MangaPageThumbnail";

const API_URL = import.meta.env.VITE_API_URL;
const GALLERY_PAGE_SIZE = 20;

function displayTagName(tag: MangaTag) {
  if (tag.esMale) return tag.name.replace(/^male:/, "");
  if (tag.esFemale) return tag.name.replace(/^female:/, "");
  return tag.name;
}

function MangaReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { mangas, index } = location.state || {};

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [portadaSrc, setPortadaSrc] = useState<string | null>(null);

  const [totalPaginas, setTotalPaginas] = useState(0);
  const [galeriaPaginas, setGaleriaPaginas] = useState<MangaPagina[]>([]);
  const [galeriaTotalPages, setGaleriaTotalPages] = useState(0);

  const listPage = searchParams.get("page") || "0";
  const sort = searchParams.get("sort") || "id,desc";
  const qParam = searchParams.get("q");
  const artistParam = searchParams.get("artist");
  const groupParam = searchParams.get("group");
  const parodyParam = searchParams.get("parody");

  const pParam = searchParams.get("p");
  const isReaderMode = pParam !== null;
  const pageNum = Number(pParam) || 1;
  const galeriaPage = Number(searchParams.get("gp")) || 0;

  const buildListQuery = () => {
    const params = new URLSearchParams({ page: listPage, sort });
    if (qParam) params.set("q", qParam);
    if (artistParam) params.set("artist", artistParam);
    if (groupParam) params.set("group", groupParam);
    if (parodyParam) params.set("parody", parodyParam);
    return params.toString();
  };

  useEffect(() => {
    getMangaById(Number(id))
      .then((data) => {
        setManga(data);
        setNotFound(false);
      })
      .catch((error) => {
        console.error("Error cargando manga", error);
        setNotFound(true);
      });
  }, [id]);

  useEffect(() => {
    if (!manga) return;

    let objectUrl: string | null = null;

    const fetchPortada = async () => {
      try {
        const response = await fetch(
          `${API_URL}${manga.portadaUrl}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          console.error("Error cargando la portada");
          return;
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPortadaSrc(objectUrl);
      } catch (error) {
        console.error("Error en fetch portada", error);
      }
    };

    fetchPortada();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [manga]);

  useEffect(() => {
    if (!id) return;

    getMangaPaginas(Number(id), 0, 1)
      .then((data) => setTotalPaginas(data.totalElements))
      .catch((error) => console.error("Error obteniendo el total de páginas", error));
  }, [id]);

  useEffect(() => {
    if (isReaderMode || !id) return;

    getMangaPaginas(Number(id), galeriaPage, GALLERY_PAGE_SIZE)
      .then((data) => {
        setGaleriaPaginas(data.content);
        setGaleriaTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Error cargando la galería", error));
  }, [id, galeriaPage, isReaderMode]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPaginas) return;
    const params = new URLSearchParams(searchParams);
    params.set("p", newPage.toString());
    setSearchParams(params);
  };

  const openPage = (orden: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("p", orden.toString());
    setSearchParams(params);
  };

  const goToGaleriaPage = (newPage: number) => {
    if (newPage < 0 || newPage >= galeriaTotalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("gp", newPage.toString());
    setSearchParams(params);
  };

  const handleBackToSummary = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("p");
    setSearchParams(params);
  };

  useEffect(() => {
    if (!isReaderMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToPage(pageNum + 1);
      if (e.key === "ArrowLeft") goToPage(pageNum - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, totalPaginas, isReaderMode]);

  const handleExit = () => {
    navigate(`/manga?${buildListQuery()}`);
  };

  const nextManga = () => {
    if (!mangas) return;

    if (index < mangas.length - 1) {
      const next = mangas[index + 1];
      navigate(`/manga/${next.id}?${buildListQuery()}`, {
        state: { mangas, index: index + 1 }
      });
    }
  };

  const previousManga = () => {
    if (!mangas) return;

    if (index > 0) {
      const prev = mangas[index - 1];
      navigate(`/manga/${prev.id}?${buildListQuery()}`, {
        state: { mangas, index: index - 1 }
      });
    }
  };

  if (notFound) {
    return (
      <div className="page-container">
        <h1>Manga no encontrado</h1>
        <button className="back-button" onClick={handleExit}>✕ Volver</button>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="page-container">
        <h1>Cargando manga...</h1>
      </div>
    );
  }

  return (
    <div className="image-viewer-page manga-reader-page">
      <header style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={handleExit}>
          ✕ Salir
        </button>
        <div className="nav-group">
          {isReaderMode && (
            <button className="back-button" onClick={handleBackToSummary}>
              ‹ Volver al resumen
            </button>
          )}
          <button className="back-button" onClick={previousManga} disabled={!mangas || index === 0}>
            ⏮ Manga anterior
          </button>
          <button className="back-button" onClick={nextManga} disabled={!mangas || index === mangas.length - 1}>
            Manga siguiente ⏭
          </button>
        </div>
      </header>

      {isReaderMode ? (
        <>
          <h1 className="player-title">{manga.title}</h1>

          <div className="image-container">
            <img
              className="image-viewer"
              src={`${API_URL}/api/mangas/${id}/paginas/${pageNum}/imagen`}
              alt={`${manga.title} - página ${pageNum}`}
            />
          </div>

          <div className="player-controls">
            <div className="nav-group">
              <button className="back-button" onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}>
                ⏮ Página anterior
              </button>
              <button className="back-button" onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPaginas}>
                Página siguiente ⏭
              </button>
            </div>
            <span className="manga-page-counter">Página {pageNum} de {totalPaginas}</span>
          </div>
        </>
      ) : (
        <>
          <div className="manga-summary-cover">
            {portadaSrc ? (
              <img className="manga-summary-thumbnail" src={portadaSrc} alt={manga.title} />
            ) : (
              <div className="manga-summary-thumbnail-placeholder">Cargando...</div>
            )}
          </div>

          <h1 className="player-title">{manga.title}</h1>

          {manga.artists.length > 0 && (
            <p className="manga-summary-artists">{manga.artists.join(", ")}</p>
          )}

          <div className="manga-card-details">
            {manga.groups.length > 0 && (
              <div className="manga-detail-row">
                <span className="manga-detail-label">Group:</span>
                <span className="manga-group-badge">{manga.groups.join(", ")}</span>
              </div>
            )}
            <div className="manga-detail-row">
              <span className="manga-detail-label">Type:</span>
              <span className="manga-tipo-badge">{manga.tipo}</span>
            </div>
            <div className="manga-detail-row">
              <span className="manga-detail-label">Language:</span>
              <span className="manga-language-badge">{manga.language}</span>
            </div>
            {manga.parodys.length > 0 && (
              <div className="manga-detail-row">
                <span className="manga-detail-label">Series:</span>
                <span className="manga-parody-badge">{manga.parodys.join(", ")}</span>
              </div>
            )}
            {manga.tags.length > 0 && (
              <div className="manga-detail-row manga-card-tags-row">
                <span className="manga-detail-label">Tags:</span>
                <div className="manga-card-tags">
                  {manga.tags.map((tag) => (
                    <span key={tag.name} className="video-tag-badge">
                      {tag.esMale && "♂ "}
                      {tag.esFemale && "♀ "}
                      {displayTagName(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h2 className="manga-gallery-heading">Páginas</h2>

          <div className="pagination-container">
            <button
              className="pagination-button"
              disabled={galeriaPage === 0}
              onClick={() => goToGaleriaPage(galeriaPage - 1)}
            >
              ◀ Anterior
            </button>
            <span className="manga-page-counter">Página {galeriaPage + 1} de {Math.max(galeriaTotalPages, 1)}</span>
            <button
              className="pagination-button"
              disabled={galeriaPage + 1 >= galeriaTotalPages}
              onClick={() => goToGaleriaPage(galeriaPage + 1)}
            >
              Siguiente ▶
            </button>
          </div>

          <div className="manga-gallery-grid">
            {galeriaPaginas.map((pagina) => (
              <MangaPageThumbnail
                key={pagina.orden}
                pagina={pagina}
                onClick={() => openPage(pagina.orden)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MangaReaderPage;
