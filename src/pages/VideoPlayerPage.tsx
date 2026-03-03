
import { useNavigate, useParams } from "react-router-dom";
import { deleteVideo } from "../api/VideoApi";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "0";

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

  return (
    <div className="video-player-page">
      <button className="back-button"
        onClick={() => navigate(`/?page=${page}`)}>
        Volver
      </button>

      <h1 className="player-title">Reproduciendo video</h1>
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