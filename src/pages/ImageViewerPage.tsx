
import { useNavigate, useParams } from "react-router-dom";
import { deleteImage, getGalleryPage } from "../api/ImageApi";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react"
import { addTagsToImage } from "../api/ImageApi";
import { getAllTags } from "../api/TagApi";

const API_URL = import.meta.env.VITE_API_URL;

function ImageViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "0";

  const location = useLocation();
  const { images, index, from: fromState, totalPages } = location.state || {};
  // Lista de origen (ruta + query params). Fallback para accesos directos sin state.
  const from: string = fromState || `/gallery?page=${page}`;
  const isUntaggedOrigin = from.startsWith("/gallery/untagged");

  // Solo desde la galería con tag se puede pasar de página sin salir del visor
  const fromUrl = new URL(from, window.location.origin);
  const isGalleryOrigin = fromUrl.pathname === "/gallery";
  const fromPage = Number(fromUrl.searchParams.get("page")) || 0;
  const fromSort = fromUrl.searchParams.get("sort") || "id,desc";
  const fromTag = fromUrl.searchParams.get("tag");
  const [loadingPage, setLoadingPage] = useState(false);
  const [noMorePages, setNoMorePages] = useState(false);
  const canGoNextPage = isGalleryOrigin && !noMorePages && (totalPages === undefined || fromPage < totalPages - 1);
  const canGoPrevPage = isGalleryOrigin && fromPage > 0;

  const imageUrl = `${API_URL}/api/images/${id}/image`;

  const [showTagModal, setShowTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);


  useEffect(() => {
    if (showTagModal) {
      getAllTags(0, 1000, "IMAGE").then(response => {
        const tags = response.content || response;
        setAvailableTags(tags)
      }
      ).catch(console.error);
    }
  }, [showTagModal]);

  useEffect(() => {
    if (images && images[index]) {
      const currentImageTags = images[index].tags || [];
      const currentTagIds = currentImageTags.map((t: any) => t.id);
      setSelectedTagIds(currentTagIds);
    }
  }, [index, images, showTagModal]);

  const handleExit = () => {
    navigate(from);
  };

  const handleSaveTags = async () => {
    try {
      const updatedImage = await addTagsToImage(Number(id), selectedTagIds);

      // Modo cola: desde "Sin tag", la imagen ya etiquetada sale de la lista y se pasa a la siguiente
      if (images && isUntaggedOrigin && updatedImage.tags?.length > 0) {
        setShowTagModal(false);
        const remaining = images.filter((_img: unknown, i: number) => i !== index);
        if (remaining.length === 0) {
          navigate(from, { replace: true });
          return;
        }
        const nextIndex = Math.min(index, remaining.length - 1);
        navigate(`/gallery/${remaining[nextIndex].id}`, {
          state: { images: remaining, index: nextIndex, from, totalPages },
          replace: true
        });
        return;
      }

      if (images) {
        const newImages = [...images];
        newImages[index] = updatedImage;

        const currentQuery = searchParams.toString();

        navigate({
          pathname: location.pathname,
          search: `?${currentQuery}`
        }, {
          state: { images: newImages, index, from, totalPages },
          replace: true
        });
      }

      setShowTagModal(false);
    } catch (error) {
      alert("Error al guardar tags");
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(i => i !== tagId) : [...prev, tagId]
    );
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar la imagen?"
    );

    if (!confirmDelete) return;

    try {
      await deleteImage(Number(id));
      navigate(from);
    } catch (error) {
      console.error("Error eliminando la imagen ", error);
      alert("No se pudo eliminar la imagen");
    }
  };

  // Carga otra página de la galería (mismo orden y tags) y abre su primera o última imagen
  const goToPage = async (targetPage: number, position: "first" | "last") => {
    setLoadingPage(true);
    try {
      const data = await getGalleryPage(targetPage, fromSort, fromTag);
      if (!data.content || data.content.length === 0) {
        if (position === "first") setNoMorePages(true);
        return;
      }
      const targetIndex = position === "first" ? 0 : data.content.length - 1;
      const target = data.content[targetIndex];
      const newParams = new URLSearchParams(fromUrl.searchParams);
      newParams.set("page", String(targetPage));
      setNoMorePages(false);
      navigate(`/gallery/${target.id}`, {
        state: {
          images: data.content,
          index: targetIndex,
          from: `${fromUrl.pathname}?${newParams.toString()}`,
          totalPages: data.totalPages
        }
      });
    } catch (error) {
      console.error("Error cargando la página de imágenes", error);
      alert("No se pudo cargar la página de imágenes");
    } finally {
      setLoadingPage(false);
    }
  };

  const nextImage = () => {
    if (!images || loadingPage) return;

    if (index < images.length - 1) {
      const next = images[index + 1];

      navigate(`/gallery/${next.id}`, {
        state: { images, index: index + 1, from, totalPages }
      });
    } else if (canGoNextPage) {
      goToPage(fromPage + 1, "first");
    }
  };

  const previousImage = () => {
    if (!images || loadingPage) return;

    if (index > 0) {
      const prev = images[index - 1];

      navigate(`/gallery/${prev.id}`, {
        state: { images, index: index - 1, from, totalPages }
      });
    } else if (canGoPrevPage) {
      goToPage(fromPage - 1, "last");
    }
  };

  return (
    <div className="image-viewer-page">
      <header style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={handleExit}>
          ✕ Salir
        </button>
        <div style={{ width: '80px' }}></div>
        <button
          className="back-button tag-manage-btn"
          onClick={() => setShowTagModal(true)}
        >
          🏷️ Gestionar Tags
        </button>
      </header>

      <h1 className="player-title">
        {images[index]?.title || "Imagen"}
      </h1>
      <div className="current-video-tags">
        {images[index]?.tags?.map((tag: any) => (
          <span key={tag.id} className="video-tag-badge">
            {tag.name}
          </span>
        ))}
      </div>

      <div className="image-container">
        <img
          className="image-viewer"
          src={imageUrl}
          alt={images[index]?.title || "Imagen"}
        />
      </div>

      <div className="player-controls">
        <div className="nav-group">
          <button
            className="back-button"
            onClick={previousImage}
            disabled={!images || loadingPage || (index === 0 && !canGoPrevPage)}
          >
            ⏮ Anterior
          </button>
          <button
            className="back-button"
            onClick={nextImage}
            disabled={!images || loadingPage || (index === images.length - 1 && !canGoNextPage)}
          >
            Siguiente ⏭
          </button>
        </div>

        <button className="back-button delete-button" onClick={handleDelete}>
          🗑️ Eliminar
        </button>
      </div>

      {showTagModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowTagModal(false);
          }}
        >
          <div className="tag-modal">
            <h3>Seleccionar Tags</h3>

            <div className="tag-selection-grid">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-pill ${selectedTagIds.includes(tag.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTag(tag.id);
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            <div className="modal-footer">
              <button className="back-button" onClick={() => setShowTagModal(false)}>
                Cancelar
              </button>
              <button className="save-btn" onClick={handleSaveTags}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageViewerPage;
