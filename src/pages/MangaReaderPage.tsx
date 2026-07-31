import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { getMangaById } from "../api/MangaApi";
import type { MangaDetail, MangaTag } from "../types/Manga";

const API_URL = import.meta.env.VITE_API_URL;

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

  const listPage = searchParams.get("page") || "0";
  const sort = searchParams.get("sort") || "id,desc";
  const qParam = searchParams.get("q");
  const artistParam = searchParams.get("artist");
  const groupParam = searchParams.get("group");
  const parodyParam = searchParams.get("parody");
  const pageNum = Number(searchParams.get("p")) || 1;

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

  const totalPaginas = manga?.paginas.length || 0;
  const currentPagina = manga?.paginas.find(p => p.orden === pageNum) || manga?.paginas[0];

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPaginas) return;
    const params = new URLSearchParams(searchParams);
    params.set("p", newPage.toString());
    setSearchParams(params);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToPage(pageNum + 1);
      if (e.key === "ArrowLeft") goToPage(pageNum - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum, totalPaginas]);

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
          <button className="back-button" onClick={previousManga} disabled={!mangas || index === 0}>
            ⏮ Manga anterior
          </button>
          <button className="back-button" onClick={nextManga} disabled={!mangas || index === mangas.length - 1}>
            Manga siguiente ⏭
          </button>
        </div>
      </header>

      <h1 className="player-title">{manga.title}</h1>

      <div className="manga-meta-block">
        <span className="manga-tipo-badge">{manga.tipo}</span>
        <span className="manga-language-badge">{manga.language}</span>
        {manga.artists.length > 0 && <span className="manga-meta-item">Artista: {manga.artists.join(", ")}</span>}
        {manga.groups.length > 0 && <span className="manga-meta-item">Grupo: {manga.groups.join(", ")}</span>}
        {manga.parodys.length > 0 && <span className="manga-meta-item">Parody: {manga.parodys.join(", ")}</span>}
      </div>

      <div className="current-video-tags">
        {manga.tags.map((t) => (
          <span key={t.name} className="video-tag-badge">
            {t.esMale && "♂ "}
            {t.esFemale && "♀ "}
            {displayTagName(t)}
          </span>
        ))}
      </div>

      <div className="image-container">
        {currentPagina && (
          <img
            className="image-viewer"
            src={`${API_URL}${currentPagina.url}`}
            alt={`${manga.title} - página ${currentPagina.orden}`}
          />
        )}
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
    </div>
  );
}

export default MangaReaderPage;
