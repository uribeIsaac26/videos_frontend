import type { Manga } from "../types/Manga";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  manga: Manga;
  currentPage: number;
  mangas: Manga[];
  index: number;
  sortBy: string;
  queryString: string;
}

function MangaCard({ manga, currentPage, mangas, index, sortBy, queryString }: Props) {

  const navigate = useNavigate();
  const [portadaSrc, setPortadaSrc] = useState<string | null>(null);

  const handleClick = () => {
    const params = new URLSearchParams(queryString);
    params.set("page", String(currentPage));
    params.set("sort", sortBy);
    navigate(`/manga/${manga.id}?${params.toString()}`, {
      state: { mangas, index }
    });
  };

  useEffect(() => {
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
  }, [manga.id, manga.portadaUrl]);

  return (
    <div className="manga-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      {portadaSrc ? (
        <img className="thumbnail" src={portadaSrc} alt={manga.title} />
      ) : (
        <div className="thumbnail-placeholder">Cargando...</div>
      )}

      <h3 className="manga-title">{manga.title}</h3>
      <div className="manga-meta-row">
        <span className="manga-tipo-badge">{manga.tipo}</span>
        <span className="manga-language-badge">{manga.language}</span>
      </div>
    </div>
  );
}

export default MangaCard;
