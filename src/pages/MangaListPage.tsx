import { useEffect, useState } from "react";
import type { Manga } from "../types/Manga";
import {
    getAllMangas,
    getMangasByArtist,
    getMangasByGroup,
    getMangasByParody,
    getMangaSugerencias,
    searchMangas,
} from "../api/MangaApi";
import MangaCard from "../components/MangaCard";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu";

type FilterType = "search" | "artist" | "group" | "parody";

const FILTER_LABELS: Record<FilterType, string> = {
    search: "Búsqueda",
    artist: "Artista",
    group: "Grupo",
    parody: "Parody",
};

function getLastToken(value: string) {
    const lastSpaceIndex = value.lastIndexOf(" ");
    return lastSpaceIndex === -1 ? value.trim() : value.slice(lastSpaceIndex + 1);
}

function applySuggestion(value: string, suggestion: string) {
    const lastSpaceIndex = value.lastIndexOf(" ");
    const prefix = lastSpaceIndex === -1 ? "" : value.slice(0, lastSpaceIndex + 1);
    return `${prefix}${suggestion} `;
}

// Prefijos de filtro soportados por el buscador de mangas (ver /api/mangas/search)
const SEARCH_FILTER_PREFIXES = ["language", "tag", "male", "female", "group", "artist", "parody"];
const PREFIX_TOKEN_RE = new RegExp(`^-?(?:${SEARCH_FILTER_PREFIXES.join("|")}):`);

// Prefijos cuyo valor es normalmente un nombre propio de varias palabras (ej. "artist:John Doe").
// Solo para estos se continúa uniendo las palabras siguientes con "_" sin comillas.
// Para "tag"/"male"/"female"/"language" el valor es de una sola palabra por defecto; si se
// necesita un valor multi-palabra (ej. tag:"full color") debe ir entre comillas.
const MULTIWORD_UNQUOTED_PREFIXES = new Set(["artist", "group", "parody"]);

// El backend divide "q" por espacios, así que un valor multi-palabra sin comillas
// (ej. "artist:John Doe") se partiría en dos tokens. Reemplazamos esos espacios por "_"
// antes de enviar. Los valores con comillas (ej. tag:"full color") se dejan intactos.
function encodeMultiWordFilters(raw: string): string {
    const words = raw.trim().split(/\s+/).filter(Boolean);
    const output: string[] = [];
    let i = 0;

    while (i < words.length) {
        const word = words[i];
        const prefixMatch = word.match(PREFIX_TOKEN_RE);

        if (!prefixMatch) {
            output.push(word);
            i++;
            continue;
        }

        const prefix = prefixMatch[0];
        const filterName = prefix.replace(/^-/, "").replace(/:$/, "");
        const value = word.slice(prefix.length);
        i++;

        if (value.startsWith('"')) {
            const quotedParts = [value];
            while (!quotedParts[quotedParts.length - 1].endsWith('"') && i < words.length) {
                quotedParts.push(words[i]);
                i++;
            }
            output.push(prefix + quotedParts.join(" "));
            continue;
        }

        const valueParts = value.length > 0 ? [value] : [];
        if (MULTIWORD_UNQUOTED_PREFIXES.has(filterName)) {
            while (i < words.length && !PREFIX_TOKEN_RE.test(words[i])) {
                valueParts.push(words[i]);
                i++;
            }
        }
        output.push(prefix + valueParts.join("_"));
    }

    return output.join(" ");
}

function MangaListPage() {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState((page + 1).toString());
    const sortBy = searchParams.get("sort") || "id,desc";

    const qParam = searchParams.get("q");
    const artistParam = searchParams.get("artist");
    const groupParam = searchParams.get("group");
    const parodyParam = searchParams.get("parody");

    const [filterType, setFilterType] = useState<FilterType>("search");
    const [filterValue, setFilterValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        setInputPage((page + 1).toString());
    }, [page]);

    useEffect(() => {
        if (filterType !== "search") {
            setSuggestions([]);
            return;
        }

        const token = getLastToken(filterValue);
        if (token.length < 2) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            getMangaSugerencias(token)
                .then(setSuggestions)
                .catch((error) => {
                    console.error("Error obteniendo sugerencias", error);
                    setSuggestions([]);
                });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filterValue, filterType]);

    const handleSuggestionClick = (suggestion: string) => {
        setFilterValue((prev) => applySuggestion(prev, suggestion));
        setSuggestions([]);
    };

    const buildQueryStringForCards = () => {
        const params = new URLSearchParams();
        if (qParam) params.set("q", qParam);
        if (artistParam) params.set("artist", artistParam);
        if (groupParam) params.set("group", groupParam);
        if (parodyParam) params.set("parody", parodyParam);
        return params.toString();
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params: Record<string, string> = { page: "0", sort: newSort };
        if (qParam) params.q = qParam;
        if (artistParam) params.artist = artistParam;
        if (groupParam) params.group = groupParam;
        if (parodyParam) params.parody = parodyParam;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({ page: "0", sort: sortBy });
        setFilterValue("");
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = filterValue.trim();
        if (!value) return;

        if (filterType === "search") {
            setSearchParams({ page: "0", sort: sortBy, q: encodeMultiWordFilters(value) });
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
            if (qParam) params.q = qParam;
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
        q: string | null,
        artist: string | null,
        group: string | null,
        parody: string | null
    ) => {
        try {
            let data;
            if (q) {
                data = await searchMangas(q, currentPage, 20, currentSort);
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
        fetchMangas(page, sortBy, qParam, artistParam, groupParam, parodyParam);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [page, qParam, artistParam, groupParam, parodyParam, sortBy]);

    const hasActiveFilter = !!qParam || !!artistParam || !!groupParam || !!parodyParam;

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
                    <option value="search">Búsqueda</option>
                    <option value="artist">Artista</option>
                    <option value="group">Grupo</option>
                    <option value="parody">Parody</option>
                </select>
                <div className="manga-search-input-wrapper">
                    <input
                        type="text"
                        className="manga-filter-input"
                        placeholder={filterType === "search" ? 'ej. spanish male:bajo -tag:"full color"' : `Nombre de ${FILTER_LABELS[filterType].toLowerCase()}`}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    {filterType === "search" && isSearchFocused && suggestions.length > 0 && (
                        <div className="manga-search-suggestions">
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion}
                                    className="manga-search-suggestion-item"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button type="submit" className="pagination-button">Buscar</button>
            </form>
            {hasActiveFilter && (
                <div className="filter-status-bar">
                    {qParam && (
                        <div className="active-tag-chip">
                            {qParam}
                            <button className="remove-filter-btn" onClick={clearFilters}>✕</button>
                        </div>
                    )}
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
                </div>
            )}

            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: Record<string, string> = { page: (page - 1).toString(), sort: sortBy };
                        if (qParam) newParams.q = qParam;
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
                        if (qParam) newParams.q = qParam;
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
                        if (qParam) newParams.q = qParam;
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
                        if (qParam) newParams.q = qParam;
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
