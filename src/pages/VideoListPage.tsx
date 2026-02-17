import { useEffect, useState } from "react";
import type { Video } from "../types/Video";
import { getAllVideos } from "../api/VideoApi";
import VideoCard from "../components/VideoCard";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/AuthService";

function videoListPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const navigate = useNavigate();


    useEffect(() => {
        fetchVideos();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login")
    }

    const fetchVideos = async () => {
        try {
            const data = await getAllVideos();
            setVideos(data);
        } catch (error) {
            console.error("Error cargando videos", error);
        }
    }


    return (
        <div className="page-container">
            <h1>Videos</h1>
            <button className="back-button" onClick={() => navigate("/upload")}>
                Upload Videos
            </button>
            <button className="back-button" onClick={handleLogout}>
                Cerrar Sesion
            </button>
            <div className="video-grid">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
}

export default videoListPage;