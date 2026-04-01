
import { useNavigate, useParams } from "react-router-dom";
import { deleteVideo } from "../api/VideoApi";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react"
import { addTagsToVideo } from "../api/VideoApi";
import { getAllTags } from "../api/TagApi";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "0";

  const location = useLocation();
  const { videos, index } = location.state || {};

  const videoUrl = `${API_URL}/api/videos/${id}/video`;

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
    if (videos && videos[index]) {
      const currentVideoTags = videos[index].tags || [];
      // Extraemos solo los IDs del video actual
      const currentTagIds = currentVideoTags.map((t: any) => t.id);
      setSelectedTagIds(currentTagIds);
    }
  }, [index, videos, showTagModal]);

  const handleSaveTags = async () => {
    try {
      const updatedVideo = await addTagsToVideo(Number(id), selectedTagIds);
      if (videos) {
        const newVideos = [...videos];
        newVideos[index] = updatedVideo; // El backend nos devuelve el video con tags

        const currentQuery = searchParams.toString();

        // Actualizamos el estado de la navegación para que si el usuario 
        // vuelve atrás o sigue navegando, los tags persistan.
        navigate({
          pathname: location.pathname,
          search: `?${currentQuery}`
        }, {
          state: { videos: newVideos, index },
          replace: true
        });
      }

      setShowTagModal(false);
      // Opcional: podrías refrescar los datos del video aquí
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
      "Estas seguro de que quieres eliminar el video?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVideo(Number(id));
      navigate(`/?page=${page}`);
    } catch (error) {
      console.error("Error eliminando el video ", error);
      alert("No se pudo eliminar el video");
    }
  };

  const nextVideo = () => {
    if (!videos) return;

    if (index < videos.length - 1) {
      const next = videos[index + 1];

      navigate(`/videos/${next.id}?page=${page}`, {
        state: { videos, index: index + 1 }
      });
    }
  };

  const previousVideo = () => {
    if (!videos) return;

    if (index > 0) {
      const prev = videos[index - 1];

      navigate(`/videos/${prev.id}?page=${page}`, {
        state: { videos, index: index - 1 }
      });
    }
  };

  return (
    <div className="video-player-page">
      <header style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={() => navigate(`/?page=${page}`)}>
          ✕ Salir
        </button>
        <div style={{ width: '80px' }}></div> {/* Espaciador para centrar el título */}
        <button
          className="back-button tag-manage-btn"
          onClick={() => setShowTagModal(true)}
        >
          🏷️ Gestionar Tags
        </button>
      </header>

      <h1 className="player-title">
        {videos[index]?.title || "Reproduciendo video"}
      </h1>
      <div className="current-video-tags">
        {videos[index]?.tags?.map((tag: any) => (
          <span key={tag.id} className="video-tag-badge">
            {tag.name}
          </span>
        ))}
      </div>

      <div className="video-container">
        <video
          className="video-player"
          controls
          autoPlay
          src={videoUrl}
        />
      </div>

      <div className="player-controls">
        <div className="nav-group">
          <button
            className="back-button"
            onClick={previousVideo}
            disabled={!videos || index === 0}
          >
            ⏮ Anterior
          </button>
          <button
            className="back-button"
            onClick={nextVideo}
            disabled={!videos || index === videos.length - 1}
          >
            Siguiente ⏭
          </button>
        </div>

        <button className="back-button delete-button" onClick={handleDelete}>
          🗑️ Eliminar
        </button>
      </div>

      {showTagModal && (
        <div className="modal-overlay">
          <div className="tag-modal">
            <h3>Seleccionar Tags</h3>
            <div className="tag-selection-grid">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-pill ${selectedTagIds.includes(tag.id) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTagModal(false)}>Cancelar</button>
              <button className="save-btn" onClick={handleSaveTags}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayerPage;