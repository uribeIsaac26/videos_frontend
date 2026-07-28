import type { Video } from "../types/Video";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  video: Video;
  currentPage: number;
  videos: Video[];
  index: number;
  sortBy: string;
  tagParam?: string | null;
}

function VideoCard({ video, currentPage, videos, index, sortBy, tagParam }: Props) {

  const navigate = useNavigate();
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  const handleClick = () => {
    const params = new URLSearchParams({ page: String(currentPage), sort: sortBy });
    if (tagParam) params.set("tag", tagParam);
    navigate(`/videos/${video.id}?${params.toString()}`, {
      state: {
        videos,
        index
      }
    }
    );
  };

  useEffect(() => {
    const fetchThumnail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/videos/${video.id}/thumbnail`,
          {
            credentials: "include", // 🔥 CLAVE
          }
        );
        if (!response.ok) {
          console.error("Error cargando el thumnail");
          return;
        }
        const blob = await response.blob();
        const thumbnailUrl = URL.createObjectURL(blob);
        setThumbnailSrc(thumbnailUrl);
      } catch (error) {
        console.error("Error en fetch thumbnail", error);
      }
    };

    fetchThumnail();
    return () => {
      if (thumbnailSrc) {
        URL.revokeObjectURL(thumbnailSrc)
      }
    };;
  }, [video.id]);

  return (
    <div className="video-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      {thumbnailSrc ? (
        <img
          className="thumbnail"
          src={thumbnailSrc}
          alt={video.title}
        />
      ) : (
        <div className="thumbnail-placeholder">Cargando...</div>
      )}

      <h3 className="video-title">{video.title}</h3>
      <div className="video-tags-container">
        {video.tags && video.tags.length > 0 ? (
          video.tags.map((tag) => (
            <span key={tag.id} className="video-tag-badge">
              {tag.name}
            </span>
          ))
        ) : (
          <span className="no-tags">Sin etiquetas</span>
        )}
      </div>
    </div>
  );
}

export default VideoCard;