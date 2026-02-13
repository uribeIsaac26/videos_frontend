import type { Video } from "../types/Video";
import { useNavigate } from "react-router-dom";

interface Props{
    video: Video;
}


function VideoCard({ video }: Props){

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/videos/${video.id}`);
    };

    return (
    <div className="video-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      <img
        className="thumbnail"
        src={`http://192.168.1.7:8080/api/videos/${video.id}/thumbnail`}
        alt={video.title}
      />
      <h3 className="video-title">{video.title}</h3>
    </div>
  );
}

export default VideoCard;