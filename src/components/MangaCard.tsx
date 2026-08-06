import type { Manga, MangaTag } from "../types/Manga";
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

function displayTagName(tag: MangaTag) {
  if (tag.esMale) return tag.name.replace(/^male:/, "");
  if (tag.esFemale) return tag.name.replace(/^female:/, "");
  return tag.name;
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
      <h3 className="manga-title">{manga.title}</h3>

      {manga.artists.length > 0 && (
        <p className="manga-card-artists">{manga.artists.join(", ")}</p>
      )}

      <div className="manga-card-cover">
        {portadaSrc ? (
          <img className="manga-card-thumbnail" src={portadaSrc} alt={manga.title} />
        ) : (
          <div className="manga-card-thumbnail-placeholder">Cargando...</div>
        )}
      </div>

      <div className="manga-card-details">
        {manga.parodys.length > 0 && (
          <div className="manga-detail-row">
            <span className="manga-parody-badge">{manga.parodys.join(", ")}</span>
          </div>
        )}
        <div className="manga-detail-row">
          <span className="manga-tipo-badge">{manga.tipo}</span>
        </div>
        <div className="manga-detail-row">
          <span className="manga-language-badge">{manga.language}</span>
        </div>
      </div>

      {manga.tags.length > 0 && (
        <div className="manga-card-tags">
          {manga.tags.map((tag) => (
            <span key={tag.name} className="video-tag-badge">
              {tag.esMale && "♂ "}
              {tag.esFemale && "♀ "}
              {displayTagName(tag)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MangaCard;
