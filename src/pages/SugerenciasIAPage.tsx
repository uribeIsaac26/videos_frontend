import { useEffect, useRef, useState } from "react";
import { useSearchParams} from "react-router-dom";
import { getAllVideosPending } from "../api/VideoTagTemporalApi"; // Tu API
import type { VideoTagTemporal } from "../types/VideoTagTemporal";
import UserMenu from "../components/UserMenu";
import PredictionCard from "../components/PredictionCard";

function SugerenciasIAPage() {
    const [suggestions, setSuggestions] = useState<VideoTagTemporal[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);

    // Lógica de selección heredada de tu TagListPage
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const selectionModeRef = useRef(false);
    const timerRef = useRef<number | null>(null);
    const isLongPressActive = useRef(false);

    useEffect(() => {
        fetchPendingVideos(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const fetchPendingVideos = async (currentPage: number) => {
        try {
            const data = await getAllVideosPending(currentPage, 20); // Ajusté a 20 por página
            setSuggestions(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando sugerencias de IA", error);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const isAlreadySelected = prev.includes(id);
            const newList = isAlreadySelected
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id];

            selectionModeRef.current = newList.length > 0;
            return newList;
        });
    };

    // Handlers para el Long Press (Copiados de tu lógica original)
    const handleStart = (id: number) => {
        isLongPressActive.current = false;
        if (selectionModeRef.current) return;

        timerRef.current = window.setTimeout(() => {
            isLongPressActive.current = true;
            toggleSelection(id);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const handleEnd = (id: number) => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isLongPressActive.current) {
            isLongPressActive.current = false;
            return;
        }

        if (selectionModeRef.current) {
            toggleSelection(id);
        } else {
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
                {suggestions.map((item, index) => { // 👈 Agregamos 'index' aquí
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            className={`prediction-card-wrapper ${isSelected ? 'selected' : ''}`}
                            onPointerDown={() => handleStart(item.id)}
                            onPointerUp={() => handleEnd(item.id)}
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ touchAction: 'none', userSelect: 'none' }}
                        >
                            <PredictionCard
                                prediction={item}
                                currentPage={page}
                                allPredictions={suggestions}
                                index={index} // 👈 Ahora 'index' ya existe
                            />
                            {isSelected && <div className="check-indicator">✓</div>}
                        </div>
                    );
                })}
            </div>
            {suggestions.map((item, index) => (
                <div
                    key={item.id}
                    className={`prediction-card-wrapper ${selectedIds.includes(item.id) ? 'selected' : ''}`}
                    onPointerDown={() => handleStart(item.id)}
                    onPointerUp={() => handleEnd(item.id)}
                >
                    <PredictionCard
                        prediction={item}
                        currentPage={page}
                        allPredictions={suggestions} // <--- ASEGÚRATE DE QUE ESTO NO SEA UNDEFINED
                        index={index}
                    />
                    {selectedIds.includes(item.id) && <div className="check-indicator">✓</div>}
                </div>
            ))}
        </div>
    );
}

export default SugerenciasIAPage;