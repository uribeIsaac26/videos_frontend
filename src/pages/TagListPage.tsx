import { useEffect, useState } from "react";
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchTags(page);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [page]);

    const fetchTags = async (currentPage: number) => {
        try {
            const data = await getAllTags(currentPage, 20);
            setTags(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos ", error);
        }
    };

    // Función para marcar/desmarcar
    const toggleTagSelection = (tagId: number) => {
        setSelectedTagIds(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId) 
                : [...prev, tagId]
        );
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
                {tags.map((tag) => (
                    <div 
                        key={tag.id} 
                        className={`tag-card-wrapper ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                        onClick={() => toggleTagSelection(tag.id)}
                    >
                        <TagCard tag={tag} />
                        {/* Indicador visual de selección */}
                        {selectedTagIds.includes(tag.id) && <div className="check-mark">✓</div>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default tagListPage;