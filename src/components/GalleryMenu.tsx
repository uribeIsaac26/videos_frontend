import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GalleryMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isUntaggedView = pathname === "/gallery/untagged";

    return (
        <div className="user-menu-container">
            <button
                className="menu-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                🖼️ Menú ▾
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsOpen(false);
                            navigate(isUntaggedView ? "/gallery" : "/gallery/untagged");
                        }}
                    >
                        {isUntaggedView ? "🖼️ Imágenes con tag" : "🚫 Imágenes sin tag"}
                    </button>

                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/gallery/upload");
                        }}
                    >
                        📤 Subir Imagen
                    </button>

                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/gallery/tags");
                        }}
                    >
                        🏷️ Administrar Tags
                    </button>
                </div>
            )}
        </div>
    );
};

export default GalleryMenu;
