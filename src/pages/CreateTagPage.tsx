import { useState } from "react";
import { createTag } from "../api/TagApi"; // La función simplificada con fetch
import { useNavigate } from "react-router-dom";


function CreateTagPage() {
  const [tagName, setTagName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      alert("El nombre del tag no puede estar vacío");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await createTag(tagName);
      setMessage({ text: "¡Tag creado con éxito! 🎉", type: "success" });
      setTagName(""); // Limpiar input
      
      // Opcional: Redirigir a la lista de tags después de 1.5 segundos
      setTimeout(() => navigate("/tags"), 1500);
      
    } catch (error) {
      setMessage({ text: "Error al crear el tag. Quizás ya existe. ❌", type: "error" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="upload-page">
      <button className="back-button" onClick={() => navigate("/tags")}>
        Volver a la lista
      </button>

      <div className="upload-card">
        <h2 className="upload-title">Crear Nuevo Tag</h2>

        {message && (
          <div className={`${message.type}-message`} style={{
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Tag</label>
            <input
              type="text"
              placeholder="Ej: Comedia, Tutorial, Java..."
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <button 
            className="upload-button" 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar Tag"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTagPage;