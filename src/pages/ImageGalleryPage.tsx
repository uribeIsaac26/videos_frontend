import { useEffect, useState } from "react";
import type { Image } from "../types/Image";
import { getAllImages, getImagesByTag } from "../api/ImageApi";
import ImageCard from "../components/ImageCard";
import { useSearchParams } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import { useNavigate } from "react-router-dom";
import { getTagById } from "../api/TagApi";

function ImageGalleryPage() {
    const [images, setImages] = useState<Image[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 0;
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState((page + 1).toString());
    const tagParam = searchParams.get("tag");
    const navigate = useNavigate();
    const sortBy = searchParams.get("sort") || "id,desc";
    const tagIds = tagParam ? tagParam.split(",").map(Number) : [];
    const [tagNames, setTagNames] = useState<Record<number, string>>({});

    useEffect(() => {
        setInputPage((page + 1).toString());
    }, [page]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params: any = { page: "0", sort: newSort };
        if (tagParam) params.tag = tagParam;
        setSearchParams(params);
    };

    const removeOneTag = (idToRemove: number) => {
        const filteredTags = tagIds.filter(id => id !== idToRemove);
        const params: any = { page: "0", sort: sortBy };
        if (filteredTags.length > 0) params.tag = filteredTags.join(",");
        setSearchParams(params);
    };

    const handlePageJump = (e: React.FormEvent) => {
        e.preventDefault();

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const newPage = parseInt(inputPage) - 1;

        if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
            const params: any = { page: newPage.toString(), sort: sortBy };
            if (tagParam) params.tag = tagParam;
            setSearchParams(params);
        } else {
            setInputPage((page + 1).toString());
        }
    };

    const fetchImages = async (currentPage: number, currentTag: number[], currentSort: string) => {
        try {
            let data;
            if (currentTag && currentTag.length > 0) {
                data = await getImagesByTag(currentTag, currentPage, 20, currentSort);
            } else {
                data = await getAllImages(currentPage, 20, currentSort);
            }
            setImages(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error cargando imágenes", error);
        }
    };

    useEffect(() => {
        fetchImages(page, tagIds, sortBy);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [page, tagParam, sortBy]);

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


    return (
        <div className="page-container">
            <header className="main-header">
                <div className="header-top-row">
                    <div className="title-filter-group">
                        <h1>Galería de Imágenes</h1>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={handleSortChange}
                        >
                            <option value="id,desc">Recientes</option>
                            <option value="size,desc">Pesados ⬇️</option>
                            <option value="size,asc">Ligeros ⬆️</option>
                            <option value="title,asc">A-Z</option>
                        </select>
                    </div>

                    <div className="menu-container">
                        <UserMenu />
                    </div>
                </div>
            </header>
            {tagIds.length > 0 && (
                <div className="filter-status-bar">
                    {tagIds.map(id => (
                        <div key={id} className="active-tag-chip">
                            #{tagNames[id] || id}
                            <button className="remove-filter-btn" onClick={() => removeOneTag(id)}>✕</button>
                        </div>
                    ))}
                    {tagIds.length > 1 && (
                        <button className="clear-all-tags" onClick={() => navigate("/gallery")}>Limpiar todo</button>
                    )}
                </div>
            )}
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: any = { page: (page - 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
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
                        const newParams: any = { page: (page + 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        setSearchParams(newParams);
                    }}
                >
                    Siguiente ▶
                </button>
            </div>
            <div className="image-grid">
                {images.map((image, index) => (
                    <ImageCard
                        key={image.id}
                        image={image}
                        currentPage={page}
                        images={images}
                        index={index} />
                ))}
            </div>
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 0}
                    onClick={() => {
                        const newParams: any = { page: (page - 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
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
                        const newParams: any = { page: (page + 1).toString(), sort: sortBy };
                        if (tagParam) newParams.tag = tagParam;
                        setSearchParams(newParams);
                    }}
                >
                    Siguiente ▶
                </button>
            </div>
        </div>
    );
}

export default ImageGalleryPage;
