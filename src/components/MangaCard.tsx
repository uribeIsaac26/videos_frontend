import type { Manga } from "../types/Manga";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { buildLanguageSearchQuery, buildTagSearchQuery, displayTagName } from "../utils/mangaSearch";

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

  const navigateToFilter = (e: React.MouseEvent, params: Record<string, string>) => {
    e.stopPropagation();
    const query = new URLSearchParams({ page: "0", sort: sortBy, ...params });
    navigate(`/manga?${query.toString()}`);
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
        <div className="manga-card-artists">
          {manga.artists.map((artist) => (
            <button
              key={artist}
              type="button"
              className="manga-artist-badge manga-clickable-badge"
              onClick={(e) => navigateToFilter(e, { artist })}
            >
              {artist}
            </button>
          ))}
        </div>
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
            <span className="manga-detail-label">Parody:</span>
            {manga.parodys.map((parody) => (
              <button
                key={parody}
                type="button"
                className="manga-parody-badge manga-clickable-badge"
                onClick={(e) => navigateToFilter(e, { parody })}
              >
                {parody}
              </button>
            ))}
          </div>
        )}
        <div className="manga-detail-row">
          <span className="manga-detail-label">Type:</span>
          <span className="manga-tipo-badge">{manga.tipo}</span>
        </div>
        <div className="manga-detail-row">
          <span className="manga-detail-label">Language:</span>
          <button
            type="button"
            className="manga-language-badge manga-clickable-badge"
            onClick={(e) => navigateToFilter(e, { q: buildLanguageSearchQuery(manga.language) })}
          >
            {manga.language}
          </button>
        </div>
        {manga.tags.length > 0 && (
          <div className="manga-detail-row manga-card-tags-row">
            <span className="manga-detail-label">Tags:</span>
            <div className="manga-card-tags">
              {manga.tags.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  className="video-tag-badge manga-clickable-badge"
                  onClick={(e) => navigateToFilter(e, { q: buildTagSearchQuery(tag) })}
                >
                  {tag.esMale && "♂ "}
                  {tag.esFemale && "♀ "}
                  {displayTagName(tag)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaCard;
