
import { useNavigate, useParams } from "react-router-dom";
import { deleteVideo } from "../api/VideoApi";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "0";

  const location = useLocation();
  const { videos, index } = location.state || {};

  const videoUrl = `${API_URL}/api/videos/${id}/video`;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Estas seguro de que quieres eliminar el video?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVideo(Number(id));
      navigate(`/?page=${page}`);
    } catch (error) {
      console.error("Error eliminando el video ", error);
      alert("No se pudo eliminar el video");
    }
  };

  const nextVideo = () => {
    if (!videos) return;

    if (index < videos.length - 1) {
      const next = videos[index + 1];

      navigate(`/videos/${next.id}?page=${page}`, {
        state: { videos, index: index + 1 }
      });
    }
  };

  const previousVideo = () => {
    if (!videos) return;

    if (index > 0) {
      const prev = videos[index - 1];

      navigate(`/videos/${prev.id}?page=${page}`, {
        state: { videos, index: index - 1 }
      });
    }
  };

  return (
    <div className="video-player-page">
      <button className="back-button"
        onClick={() => navigate(`/?page=${page}`)}>
        Volver
      </button>

      <h1 className="player-title">Reproduciendo video</h1>
      <button className="back-button" onClick={previousVideo}>⏮ Anterior</button>
      <button 
      className="back-button" 
      onClick={nextVideo}
      disabled={!videos || index === videos.length - 1}
      >⏭ Siguiente</button>
      <div className="video-container">
        <video
          className="video-player"
          controls
          src={videoUrl}
        />
      </div>
      <button className="back-button" onClick={handleDelete}>
        Eliminar Video
      </button>
    </div>
  );
}

export default VideoPlayerPage;