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
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <img
        src={`http://localhost:8080/api/videos/${video.id}/thumbnail`}
        alt={video.title}
        width="250"
      />
      <h3>{video.title}</h3>
    </div>
  );
}

export default VideoCard;