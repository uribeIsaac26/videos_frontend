import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideosPending } from "../api/VideoTagTemporalApi";
import type { VideoTagTemporal } from "../types/VideoTagTemporal";
import UserMenu from "../components/UserMenu";
import PredictionCard from "../components/PredictionCard";

function SugerenciasIAPage() {
    const [suggestions, setSuggestions] = useState<VideoTagTemporal[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchPendingVideos(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const fetchPendingVideos = async (currentPage: number) => {
        try {
            const data = await getAllVideosPending(currentPage, 20);
            setSuggestions(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando sugerencias de IA", error);
        }
    };

    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Predicciones de IA</h1>
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

            <div className="tag-selection-grid">
                {suggestions.map((item, index) => (
                    <div
                        key={item.id}
                        className="prediction-card-wrapper"
                        /* Eliminamos todos los handlers de Pointer y Long Press */
                    >
                        <PredictionCard
                            prediction={item}
                            currentPage={page}
                            allPredictions={suggestions}
                            index={index}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SugerenciasIAPage;