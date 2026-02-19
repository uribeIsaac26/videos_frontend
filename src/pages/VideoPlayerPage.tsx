import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../services/AuthService";
import { deleteVideo } from "../api/VideoApi";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Estas seguro de que quieres eliminar el video?"
    );

    if(!confirmDelete) return;

    try{
      await deleteVideo(Number(id));
      navigate("/");
    }catch(error){
      console.error("Error eliminando el video ", error);
      alert("No se pudo eliminar el video");
    }
  };

  useEffect(()=>{
    const fetchVideo = async() => {
      const token = getToken();
        
      const response = await fetch(
        `${API_URL}/api/videos/${id}/video`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if(!response.ok){
        console.error("Error cargando el video");
        return;
      }

      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setVideoSrc(videoUrl)
    };

    fetchVideo();

    return () =>{
      if(videoSrc){
        URL.revokeObjectURL(videoSrc);
      }
    }
  }, [id])

  return (
    <div className="video-player-page">
      <button className="back-button" onClick={()=> navigate("/")}>
          Volver
      </button>

      <h1 className="player-title">Reproduciendo video</h1>
      <div className="video-container">

        {videoSrc ? (
          <video className="video-player" controls src={videoSrc} />
        ): (
          <p>Cargando Video..</p>
        )}
      </div>
      <button className="back-button" onClick={handleDelete}>
        Eliminar Video
      </button>
    </div>
  );
}

export default VideoPlayerPage;