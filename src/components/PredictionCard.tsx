import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VideoTagTemporal } from "../types/VideoTagTemporal";
import type { Video } from "../types/Video";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  prediction: VideoTagTemporal;
  currentPage: number;
  allPredictions: VideoTagTemporal[]; // Para poder navegar entre ellos en el reproductor
  index: number;
}

function PredictionCard({ prediction, currentPage, allPredictions, index }: Props) {
  const navigate = useNavigate();
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  // Mapeamos la predicción a un objeto tipo Video "falso" para que el reproductor lo entienda
  // Usamos los tags de la IA para que los veas en el reproductor si tu vista los muestra
  const mockVideo: Partial<Video> = {
    id: prediction.videoId,
    title: `Sugerencia IA - Video ${prediction.videoId}`,
    tags: prediction.tagsSuggest.split(',').map((tag, i) => ({ id: i, name: tag.trim() })) as any
  };

const handleClick = () => {
  navigate(`/videos/${prediction.videoId}?page=${currentPage}`, {
    state: {
      videos: allPredictions.map(p => ({ 
        id: p.videoId, 
        title: `Sugerencia IA - ${p.videoId}`,
        tags: p.tagsSuggest.split(',').map((tag, i) => ({ id: i, name: tag.trim() }))
      })),
      index,
      fromIA: true // 👈 Agregamos esta bandera
    }
  });
};

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/videos/${prediction.videoId}/thumbnail`,
          { credentials: "include" }
        );
        if (response.ok) {
          const blob = await response.blob();
          const thumbnailUrl = URL.createObjectURL(blob);
          setThumbnailSrc(thumbnailUrl);
        }
      } catch (error) {
        console.error("Error cargando thumbnail", error);
      }
    };

    fetchThumbnail();
    return () => { if (thumbnailSrc) URL.revokeObjectURL(thumbnailSrc); };
  }, [prediction.videoId]);

  return (
    <div className="prediction-card-content" onClick={handleClick} style={{ cursor: "pointer" }}>
      <div className="thumbnail-container">
        {thumbnailSrc ? (
          <img className="thumbnail" src={thumbnailSrc} alt="Preview" />
        ) : (
          <div className="thumbnail-placeholder">Cargando...</div>
        )}
      </div>
      
      <div className="prediction-info">
        <span className="video-id-badge">ID: {prediction.videoId}</span>
        <div className="tags-suggest-container">
          {prediction.tagsSuggest.split(',').map((tag, idx) => (
            <span key={idx} className="tag-badge ia-suggest">{tag.trim()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;