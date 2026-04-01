import { useEffect, useState } from "react";
import type { Video } from "../types/Video";
import { getAllVideos, getVideosByTag } from "../api/VideoApi";
import VideoCard from "../components/VideoCard";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import { useNavigate } from "react-router-dom";
import { getTagById } from "../api/TagApi";

function videoListPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState((page + 1).toString());
    const tagId = searchParams.get("tag"); // 👈 Detectamos el tag
    const navigate = useNavigate();
    const [currentTagName, setCurrentTagName] = useState<string | null>(null);

    useEffect(() => {
        setInputPage((page + 1).toString());
    }, [page]);

    const handlePageJump = (e: React.FormEvent) => {
        e.preventDefault();

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const newPage = parseInt(inputPage) - 1; // Ajustamos a base 0 para el backend

        if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
            const params: any = { page: newPage.toString() };
            if (tagId) params.tag = tagId;
            setSearchParams(params);
        } else {
            // Si el número no es válido, regresamos al valor actual
            setInputPage((page + 1).toString());
        }
    };

    useEffect(() => {
        fetchVideos(page, tagId);
        window.scrollTo({
            top: 0,
            behavior: "smooth" // puedes quitar smooth si no quieres animación
        });
    }, [page, tagId]);

    const fetchVideos = async (currentPage: number, currentTag: string | null) => {
        try {
            let data;
            if (currentTag) {
                data = await getVideosByTag(currentTag, currentPage, 10);
            } else {
                data = await getAllVideos(currentPage, 10);
            }
            setVideos(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos", error);
        }
    };

    useEffect(() => {
        if (tagId) {
            getTagById(Number(tagId))
                .then(tag => setCurrentTagName(tag.name))
                .catch(() => setCurrentTagName(null));
        } else {
            setCurrentTagName(null);
        }
    }, [tagId]);


    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Videos</h1>
                <UserMenu />
            </header>
            {tagId && (
                <div className="filter-status-bar">
                    <div className="active-tag-chip">
                        {currentTagName || tagId}
                        <button
                            className="remove-filter-btn"
                            onClick={() => navigate("/")}
                            title="Quitar filtro"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: any = { page: (page - 1).toString() };
                        if (tagId) newParams.tag = tagId; // 👈 Mantenemos el tag si existe
                        setSearchParams(newParams);
                    }}
                >
                    ◀ Anterior
                </button>

                <form className="pagination-jump-form" onSubmit={handlePageJump}>
                    <span>Página</span>
                    <input
                        type="number"
                        className="pagination-input"
                        value={inputPage}
                        onChange={(e) => setInputPage(e.target.value)}
                        onBlur={handlePageJump} // También salta si el usuario hace clic fuera
                        min="1"
                        max={totalPages}
                    />
                    <span>de {totalPages}</span>
                </form>
                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => {
                        const newParams: any = { page: (page + 1).toString() };
                        if (tagId) newParams.tag = tagId; // 👈 Mantenemos el tag si existe
                        setSearchParams(newParams);
                    }}
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
                    onClick={() => {
                        const newParams: any = { page: (page - 1).toString() };
                        if (tagId) newParams.tag = tagId; // 👈 Mantenemos el tag si existe
                        setSearchParams(newParams);
                    }}
                >
                    ◀ Anterior
                </button>

                <form className="pagination-jump-form" onSubmit={handlePageJump}>
                    <span>Página</span>
                    <input
                        type="number"
                        className="pagination-input"
                        value={inputPage}
                        onChange={(e) => setInputPage(e.target.value)}
                        onBlur={handlePageJump} // También salta si el usuario hace clic fuera
                        min="1"
                        max={totalPages}
                    />
                    <span>de {totalPages}</span>
                </form>

                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => {
                        const newParams: any = { page: (page + 1).toString() };
                        if (tagId) newParams.tag = tagId; // 👈 Mantenemos el tag si existe
                        setSearchParams(newParams);
                    }}
                >
                    Siguiente ▶
                </button>
            </div>
        </div>
    );
}

export default videoListPage;