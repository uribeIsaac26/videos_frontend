import { useEffect, useState } from "react";
import type { MangaPagina } from "../types/Manga";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  pagina: MangaPagina;
  onClick: () => void;
}

function MangaPageThumbnail({ pagina, onClick }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchThumbnail = async () => {
      try {
        const response = await fetch(
          `${API_URL}${pagina.url}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          console.error("Error cargando la página");
          return;
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (error) {
        console.error("Error en fetch de página", error);
      }
    };

    fetchThumbnail();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pagina.url]);

  return (
    <div className="manga-gallery-item" onClick={onClick} style={{ cursor: "pointer" }}>
      {src ? (
        <img className="manga-gallery-thumbnail" src={src} alt={`Página ${pagina.orden}`} />
      ) : (
        <div className="manga-gallery-thumbnail-placeholder">Cargando...</div>
      )}
      <span className="manga-gallery-page-number">{pagina.orden}</span>
    </div>
  );
}

export default MangaPageThumbnail;
