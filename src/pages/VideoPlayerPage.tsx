import { useParams } from "react-router-dom";

function VideoPlayerPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Reproduciendo video</h1>

      <video
        width="800"
        controls
        src={`http://localhost:8080/api/videos/${id}/video`}
      />
    </div>
  );
}

export default VideoPlayerPage;