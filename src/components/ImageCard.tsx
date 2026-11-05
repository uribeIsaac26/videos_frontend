import type { Image } from "../types/Image";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  image: Image;
  images: Image[];
  index: number;
}

function ImageCard({ image, images, index }: Props) {

  const navigate = useNavigate();
  const location = useLocation();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleClick = () => {
    // URL exacta de la lista de origen (ruta + page/sort/tag) para que el visor vuelva a ella
    const from = location.pathname + location.search;
    navigate(`/gallery/${image.id}`, {
      state: {
        images,
        index,
        from
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
    </div>
  );
}

export default ImageCard;
