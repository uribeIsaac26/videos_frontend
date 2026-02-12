import { useNavigate, useParams } from "react-router-dom";

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="player-page">
      <button className="back-button" onClick={()=> navigate("/")}>
          Volver
      </button>

      <h1 className="player-title">Reproduciendo video</h1>
      <div className="video--container">
        <video 
          className="videoo-player"
          controls
          src={`http://localhost:8080/api/videos/${id}/video`}
        />
      </div>
    </div>
  );
}

export default VideoPlayerPage;