import { useEffect, useState } from "react";
import type { Video } from "../types/Video";
import { getAllVideos } from "../api/VideoApi";
import VideoCard from "../components/VideoCard";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/AuthService";

function videoListPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();


    useEffect(() => {
        fetchVideos(page);
    }, [page]);

    const handleLogout = () => {
        logout();
        navigate("/login")
    }

    const fetchVideos = async (currentPage: number) => {
        try {
            const data = await getAllVideos(currentPage, 6);
            console.log("DATA:", data);
            setVideos(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos", error);
        }
    };


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
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </button>

                <span style={{ margin: "0 15px" }}>
                    Página {page + 1} de {totalPages}
                </span>

                <button
                    disabled={page + 1 === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}

export default videoListPage;