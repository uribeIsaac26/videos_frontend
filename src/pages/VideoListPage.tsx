import { useEffect, useState } from "react";
import type { Video } from "../types/Video";
import { getAllVideos } from "../api/VideoApi";
import VideoCard from "../components/VideoCard";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu"; // Nuevo componente

function videoListPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);


    useEffect(() => {
        fetchVideos(page);
        window.scrollTo({
            top: 0,
            behavior: "smooth" // puedes quitar smooth si no quieres animación
        });
    }, [page]);

    const fetchVideos = async (currentPage: number) => {
        try {
            const data = await getAllVideos(currentPage, 10);
            setVideos(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos", error);
        }
    };


    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Videos</h1>
                <UserMenu />
            </header>
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => setSearchParams({ page: (page - 1).toString() })}
                >
                    ◀ Anterior
                </button>

                <span className="pagination-info">
                    Página {page + 1} de {totalPages}
                </span>

                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => setSearchParams({ page: (page + 1).toString() })}
                >
                    Siguiente ▶
                </button>
            </div>
            <div className="video-grid">
                {videos.map((video, index) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        currentPage={page}
                        videos={videos}
                        index={index} />
                ))}
            </div>
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => setSearchParams({ page: (page - 1).toString() })}
                >
                    ◀ Anterior
                </button>

                <span className="pagination-info">
                    Página {page + 1} de {totalPages}
                </span>

                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => setSearchParams({ page: (page + 1).toString() })}
                >
                    Siguiente ▶
                </button>
            </div>
        </div>
    );
}

export default videoListPage;