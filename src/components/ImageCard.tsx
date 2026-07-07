import type { Image } from "../types/Image";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  image: Image;
  currentPage: number;
  images: Image[];
  index: number;
}

function ImageCard({ image, currentPage, images, index }: Props) {

  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleClick = () => {
    navigate(`/gallery/${image.id}?page=${currentPage}`, {
      state: {
        images,
        index
      }
    }
    );
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/images/${image.id}/image`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          console.error("Error cargando la imagen");
          return;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error("Error en fetch imagen", error);
      }
    };

    fetchImage();
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [image.id]);

  return (
    <div className="image-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      {imageSrc ? (
        <img
          className="thumbnail"
          src={imageSrc}
          alt={image.title}
        />
      ) : (
        <div className="thumbnail-placeholder">Cargando...</div>
      )}

      <h3 className="image-title">{image.title}</h3>
      <div className="video-tags-container">
        {image.tags && image.tags.length > 0 ? (
          image.tags.map((tag) => (
            <span key={tag.id} className="video-tag-badge">
              {tag.name}
            </span>
          ))
        ) : (
          <span className="no-tags">Sin etiquetas</span>
        )}
      </div>
    </div>
  );
}

export default ImageCard;
