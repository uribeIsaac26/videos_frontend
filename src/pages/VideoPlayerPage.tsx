import { useNavigate, useParams } from "react-router-dom";

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
          src={`http://192.168.1.7:8080/api/videos/${id}/video`}
        />
      </div>
    </div>
  );
}

export default VideoPlayerPage;