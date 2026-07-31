import { useEffect, useState } from "react";
import type { Manga } from "../types/Manga";
import {
    getAllMangas,
    getMangasByArtist,
    getMangasByGroup,
    getMangasByParody,
    getMangasByTag,
} from "../api/MangaApi";
import { getTagById, getTagsByName } from "../api/TagApi";
import MangaCard from "../components/MangaCard";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import { useNavigate } from "react-router-dom";

type FilterType = "tag" | "artist" | "group" | "parody";

const FILTER_LABELS: Record<FilterType, string> = {
    tag: "Tag",
    artist: "Artista",
    group: "Grupo",
    parody: "Parody",
};

function MangaListPage() {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState((page + 1).toString());
    const navigate = useNavigate();
    const sortBy = searchParams.get("sort") || "id,desc";

    const tagParam = searchParams.get("tag");
    const artistParam = searchParams.get("artist");
    const groupParam = searchParams.get("group");
    const parodyParam = searchParams.get("parody");
    const tagIds = tagParam ? tagParam.split(",").map(Number) : [];
    const [tagNames, setTagNames] = useState<Record<number, string>>({});

    const [filterType, setFilterType] = useState<FilterType>("tag");
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        setInputPage((page + 1).toString());
    }, [page]);

    const buildQueryStringForCards = () => {
        const params = new URLSearchParams();
        if (tagParam) params.set("tag", tagParam);
        if (artistParam) params.set("artist", artistParam);
        if (groupParam) params.set("group", groupParam);
        if (parodyParam) params.set("parody", parodyParam);
        return params.toString();
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params: Record<string, string> = { page: "0", sort: newSort };
        if (tagParam) params.tag = tagParam;
        if (artistParam) params.artist = artistParam;
        if (groupParam) params.group = groupParam;
        if (parodyParam) params.parody = parodyParam;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({ page: "0", sort: sortBy });
    };

    const removeOneTag = (idToRemove: number) => {
        const filteredTags = tagIds.filter(id => id !== idToRemove);
        const params: Record<string, string> = { page: "0", sort: sortBy };
        if (filteredTags.length > 0) params.tag = filteredTags.join(",");
        setSearchParams(params);
    };

    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = filterValue.trim();
        if (!value) return;

        if (filterType === "tag") {
            try {
                const names = value.split(",").map(n => n.trim()).filter(Boolean);
                const tags = await getTagsByName(names);
                if (tags.length === 0) {
                    alert("No se encontraron tags con ese nombre");
                    return;
                }
                setSearchParams({ page: "0", sort: sortBy, tag: tags.map(t => t.id).join(",") });
            } catch (error) {
                console.error("Error resolviendo tags", error);
                alert("No se pudieron resolver los tags");
            }
            return;
        }

        setSearchParams({ page: "0", sort: sortBy, [filterType]: value });
    };

    const handlePageJump = (e: React.FormEvent) => {
        e.preventDefault();

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const newPage = parseInt(inputPage) - 1;

        if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
            const params: Record<string, string> = { page: newPage.toString(), sort: sortBy };
            if (tagParam) params.tag = tagParam;
            if (artistParam) params.artist = artistParam;
            if (groupParam) params.group = groupParam;
            if (parodyParam) params.parody = parodyParam;
            setSearchParams(params);
        } else {
            setInputPage((page + 1).toString());
        }
    };

    const fetchMangas = async (
        currentPage: number,
        currentSort: string,
        tag: number[],
        artist: string | null,
        group: string | null,
        parody: string | null
    ) => {
        try {
            let data;
            if (tag && tag.length > 0) {
                data = await getMangasByTag(tag, currentPage, 20, currentSort);
            } else if (artist) {
                data = await getMangasByArtist(artist, currentPage, 20, currentSort);
            } else if (group) {
                data = await getMangasByGroup(group, currentPage, 20, currentSort);
            } else if (parody) {
                data = await getMangasByParody(parody, currentPage, 20, currentSort);
            } else {
                data = await getAllMangas(currentPage, 20, currentSort);
            }
            setMangas(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando mangas", error);
        }
    };

    useEffect(() => {
        fetchMangas(page, sortBy, tagIds, artistParam, groupParam, parodyParam);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [page, tagParam, artistParam, groupParam, parodyParam, sortBy]);

    useEffect(() => {
        if (!tagParam) return;

        tagIds.forEach(id => {
            if (!tagNames[id]) {
                getTagById(id).then(tag => {
                    setTagNames(prev => {
                        if (prev[id]) return prev;
                        return { ...prev, [id]: tag.name };
                    });
                }).catch(() => {});
            }
        });
    }, [tagParam]);

    const hasActiveFilter = tagIds.length > 0 || !!artistParam || !!groupParam || !!parodyParam;

    return (
        <div className="page-container">
            <header className="main-header">
                <div className="header-top-row">
                    <div className="title-filter-group">
                        <h1>Manga</h1>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={handleSortChange}
                        >
                            <option value="id,desc">Recientes</option>
                            <option value="fechaPublicacion,desc">Fecha publicación</option>
                            <option value="title,asc">A-Z</option>
                        </select>
                    </div>

                    <div className="menu-container">
                        <UserMenu />
                    </div>
                </div>
            </header>

            <form className="manga-filter-form" onSubmit={handleFilterSubmit}>
                <select
                    className="sort-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                >
                    <option value="tag">Tag</option>
                    <option value="artist">Artista</option>
                    <option value="group">Grupo</option>
                    <option value="parody">Parody</option>
                </select>
                <input
                    type="text"
                    className="manga-filter-input"
                    placeholder={filterType === "tag" ? "Nombres de tag separados por coma" : `Nombre de ${FILTER_LABELS[filterType].toLowerCase()}`}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                />
                <button type="submit" className="pagination-button">Buscar</button>
            </form>

            {hasActiveFilter && (
                <div className="filter-status-bar">
                    {tagIds.map(id => (
                        <div key={id} className="active-tag-chip">
                            #{tagNames[id] || id}
                            <button className="remove-filter-btn" onClick={() => removeOneTag(id)}>✕</button>
                        </div>
                    ))}
                    {artistParam && (
                        <div className="active-tag-chip">
                            Artista: {artistParam}
                            <button className="remove-filter-btn" onClick={clearFilters}>✕</button>
                        </div>
                    )}
                    {groupParam && (
                        <div className="active-tag-chip">
                            Grupo: {groupParam}
                            <button className="remove-filter-btn" onClick={clearFilters}>✕</button>
                        </div>
                    )}
                    {parodyParam && (
                        <div className="active-tag-chip">
                            Parody: {parodyParam}
                            <button className="remove-filter-btn" onClick={clearFilters}>✕</button>
                        </div>
                    )}
                    {(tagIds.length > 1) && (
                        <button className="clear-all-tags" onClick={() => navigate("/manga")}>Limpiar todo</button>
                    )}
                </div>
            )}

            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: Record<string, string> = { page: (page - 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        if (artistParam) newParams.artist = artistParam;
                        if (groupParam) newParams.group = groupParam;
                        if (parodyParam) newParams.parody = parodyParam;
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
                        onBlur={handlePageJump}
                        min="1"
                        max={totalPages}
                    />
                    <span>de {totalPages}</span>
                </form>
                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => {
                        const newParams: Record<string, string> = { page: (page + 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        if (artistParam) newParams.artist = artistParam;
                        if (groupParam) newParams.group = groupParam;
                        if (parodyParam) newParams.parody = parodyParam;
                        setSearchParams(newParams);
                    }}
                >
                    Siguiente ▶
                </button>
            </div>

            <div className="manga-grid">
                {mangas.map((manga, index) => (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        currentPage={page}
                        mangas={mangas}
                        index={index}
                        sortBy={sortBy}
                        queryString={buildQueryStringForCards()}
                    />
                ))}
            </div>

            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: Record<string, string> = { page: (page - 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        if (artistParam) newParams.artist = artistParam;
                        if (groupParam) newParams.group = groupParam;
                        if (parodyParam) newParams.parody = parodyParam;
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
                        onBlur={handlePageJump}
                        min="1"
                        max={totalPages}
                    />
                    <span>de {totalPages}</span>
                </form>

                <button
                    className="pagination-button"
                    disabled={page + 1 === totalPages}
                    onClick={() => {
                        const newParams: Record<string, string> = { page: (page + 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        if (artistParam) newParams.artist = artistParam;
                        if (groupParam) newParams.group = groupParam;
                        if (parodyParam) newParams.parody = parodyParam;
                        setSearchParams(newParams);
                    }}
                >
                    Siguiente ▶
                </button>
            </div>
        </div>
    );
}

export default MangaListPage;
