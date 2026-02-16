import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="video-player-page">
      <button className="back-button" onClick={()=> navigate("/")}>
          Volver
      </button>

      <h1 className="player-title">Reproduciendo video</h1>
      <div className="video-container">
        <video 
          className="video-player"
          controls
          src={`${API_URL}/api/videos/${id}/video`}
        />
      </div>
    </div>
  );
}

export default VideoPlayerPage;