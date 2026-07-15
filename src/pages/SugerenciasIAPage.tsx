import { useEffect, useState } from "react";
import { getAllVideosPending } from "../api/VideoTagTemporalApi";
import type { VideoTagTemporal } from "../types/VideoTagTemporal";
import UserMenu from "../components/UserMenu";
import PredictionCard from "../components/PredictionCard";

const PAGE_SIZE = 1000;

function SugerenciasIAPage() {
    const [suggestions, setSuggestions] = useState<VideoTagTemporal[]>([]);

    useEffect(() => {
        fetchPendingVideos();
    }, []);

    const fetchPendingVideos = async () => {
        try {
            const data = await getAllVideosPending(0, PAGE_SIZE);
            setSuggestions(data.content);
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

            <div className="tag-selection-grid">
                {suggestions.map((item, index) => (
                    <div
                        key={item.id}
                        className="prediction-card-wrapper"
                        /* Eliminamos todos los handlers de Pointer y Long Press */
                    >
                        <PredictionCard
                            prediction={item}
                            currentPage={0}
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