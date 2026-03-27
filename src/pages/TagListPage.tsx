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
            const data = await getAllTags(currentPage, 10);
            setTags(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando videos ", error);
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
                {tags.map((tag) => (
                    <TagCard
                        key={tag.id}
                        tag={tag} />
                ))}
            </div>
        </div>
    )
}

export default tagListPage;