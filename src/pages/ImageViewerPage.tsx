
import { useNavigate, useParams } from "react-router-dom";
import { deleteImage } from "../api/ImageApi";
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
  const { images, index } = location.state || {};

  const imageUrl = `${API_URL}/api/images/${id}/image`;

  const [showTagModal, setShowTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);


  useEffect(() => {
    if (showTagModal) {
      getAllTags(0, 1000).then(response => {
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
    navigate(`/gallery?page=${page}`);
  };

  const handleSaveTags = async () => {
    try {
      const updatedImage = await addTagsToImage(Number(id), selectedTagIds);
      if (images) {
        const newImages = [...images];
        newImages[index] = updatedImage;

        const currentQuery = searchParams.toString();

        navigate({
          pathname: location.pathname,
          search: `?${currentQuery}`
        }, {
          state: { images: newImages, index },
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
      navigate(`/gallery?page=${page}`);
    } catch (error) {
      console.error("Error eliminando la imagen ", error);
      alert("No se pudo eliminar la imagen");
    }
  };

  const nextImage = () => {
    if (!images) return;

    if (index < images.length - 1) {
      const next = images[index + 1];

      navigate(`/gallery/${next.id}?page=${page}`, {
        state: { images, index: index + 1 }
      });
    }
  };

  const previousImage = () => {
    if (!images) return;

    if (index > 0) {
      const prev = images[index - 1];

      navigate(`/gallery/${prev.id}?page=${page}`, {
        state: { images, index: index - 1 }
      });
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
            disabled={!images || index === 0}
          >
            ⏮ Anterior
          </button>
          <button
            className="back-button"
            onClick={nextImage}
            disabled={!images || index === images.length - 1}
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
