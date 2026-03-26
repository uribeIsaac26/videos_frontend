import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/AuthService";

const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="user-menu-container">
            <button 
                className="menu-toggle-button" 
                onClick={() => setIsOpen(!isOpen)}
            >
                Menu ▾
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <button 
                        className="dropdown-item" 
                        onClick={() => navigate("/upload")}
                    >
                        📤 Subir Video
                    </button>
                    
                    <button 
                        className="dropdown-item" 
                        onClick={() => navigate("/tags")}
                    >
                        🏷️ Administrar Tags
                    </button>

                    <div className="dropdown-divider"></div>

                    <button 
                        className="dropdown-item logout-item" 
                        onClick={handleLogout}
                    >
                        ❌ Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;