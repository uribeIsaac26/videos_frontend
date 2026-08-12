import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VideoTagTemporal } from "../types/VideoTagTemporal";
import { getTagsByName } from "../api/TagApi";

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

const handleClick = async () => {

  const allNames = [...new Set(
    allPredictions.flatMap(p => p.tagsSuggest.split(',').map(t => t.trim()))
  )];

const allRealTags = await getTagsByName(allNames, "VIDEO");

console.log(allNames)
console.log(allRealTags)

  navigate(`/videos/${prediction.videoId}?page=${currentPage}`, {
    state: {
      videos: allPredictions.map(p => ({ 
        id: p.videoId, 
        title: `Sugerencia IA - ${p.videoId}`,
        tags: p.tagsSuggest.split(',')
        .map(t => allRealTags.find(rt => rt.name.toLowerCase() === t.trim().toLowerCase()))
        .filter(Boolean)
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