import { useEffect, useRef, useState } from "react";
import type { Tag } from "../types/Tag";
import { getAllTags } from "../api/TagApi";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import TagCard from "../components/TagCard";
import { useNavigate } from "react-router-dom";


function tagListPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false); // 👈 El interruptor
    const navigate = useNavigate();

    const selectionModeRef = useRef(false);
    const timerRef = useRef<number | null>(null);
    const isLongPressActive = useRef(false);


    useEffect(() => {
        fetchTags(page);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [page]);

    const fetchTags = async (currentPage: number) => {
        try {
            const data = await getAllTags(currentPage, 50);
            setTags(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos ", error);
        }
    };

    // Función para marcar/desmarcar
    const toggleTagSelection = (id: number) => {
        setSelectedTagIds(prev => {
            const isAlreadySelected = prev.includes(id);
            const newList = isAlreadySelected
                ? prev.filter(tagId => tagId !== id)
                : [...prev, id];

            // Actualizamos la referencia y el estado
            const hasItems = newList.length > 0;
            selectionModeRef.current = hasItems;
            setIsSelectionMode(hasItems);

            return newList;
        });
    };

    const handleStart = (id: number) => {
        isLongPressActive.current = false;

        // Si ya estamos seleccionando, no queremos que el timer haga nada
        if (selectionModeRef.current) return;

        timerRef.current = window.setTimeout(() => {
            isLongPressActive.current = true;
            toggleTagSelection(id);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const handleEnd = (id: number) => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Si fue una presión larga, bloqueamos el clic para que no se desmarque
        if (isLongPressActive.current) {
            isLongPressActive.current = false;
            return;
        }

        // 💡 Aquí está el truco: usamos la REF para decidir qué hacer
        if (selectionModeRef.current) {
            toggleTagSelection(id);
        } else {
            navigate(`/?tag=${id}`);
        }
    };

    // Función para ir a la galería con los filtros
    const handleApplyFilters = () => {
        if (selectedTagIds.length > 0) {
            // Unimos los IDs por comas: ?tag=1,2,3
            navigate(`/?tag=${selectedTagIds.join(",")}`);
        }
    };

    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Tags</h1>
                <button className="menu-toggle-button" onClick={() => navigate("/tags/create")}>
                    + Nuevo Tag
                </button>
                <UserMenu />
            </header>

            {selectedTagIds.length > 0 && (
                <div className="floating-filter-bar">
                    <span>{selectedTagIds.length} seleccionados</span>
                    <div className="action-buttons">
                        <button className="clear-btn" onClick={() => setSelectedTagIds([])}>Limpiar</button>
                        <button className="apply-btn" onClick={handleApplyFilters}>Ver Videos 🎬</button>
                    </div>
                </div>
            )}

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
                {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                        <div
                            key={tag.id}
                            className={`tag-card-wrapper ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                            onPointerDown={() => handleStart(tag.id)}
                            onPointerUp={() => handleEnd(tag.id)}
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ touchAction: 'none', userSelect: 'none' }}
                        >
                            <TagCard tag={tag} />
                            {isSelected && <div className="check-indicator">✓</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default tagListPage;