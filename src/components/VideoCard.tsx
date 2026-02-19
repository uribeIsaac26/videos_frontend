import type { Video } from "../types/Video";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/AuthService";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Props{
    video: Video;
}

function VideoCard({ video }: Props){

    const navigate = useNavigate();
    const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

    const handleClick = () => {
        navigate(`/videos/${video.id}`);
    };

    useEffect(() => {
      const fetchThumnail = async () => {
        try{
          const token = getToken();

          const response = await fetch(
            `${API_URL}/api/videos/${video.id}/thumbnail`,
            {
              headers:{
                Authorization: `Bearer ${token}`
              }
            }
          );
          if(!response.ok){
            console.error("Error cargando el thumnail");
            return;
          }
          const blob = await response.blob();
          const thumbnailUrl = URL.createObjectURL(blob);
          setThumbnailSrc(thumbnailUrl);
        }catch(error){
          console.error("Error en fetch thumbnail", error);
        }
      };

      fetchThumnail();
      return ()=> {
        if(thumbnailSrc){
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
    </div>
  );
}

export default VideoCard;