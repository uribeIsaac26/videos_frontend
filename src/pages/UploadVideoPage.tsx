import { useState } from "react";
import { uploadVideo } from "../api/VideoApi";
import { useNavigate } from "react-router-dom";

function UploadVideoPage() {

  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      alert("Debes seleccionar un video");
      return;
    }

    try {
      setIsUploading(true);
      const finalTitle = title || videoFile.name.replace(/\.[^/.]+$/, "");
      await uploadVideo(finalTitle, videoFile, thumbnailFile);
      setTitle("");
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (error) {
      console.error(error);
      alert("Error al subir video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {isUploading && (
        <div className="upload-overlay">
          <div className="upload-modal">
            <p>Subiendo video...</p>
            <div className="spinner"></div>
          </div>
        </div>
      )}
      <div className="upload-page">
        <button className="back-button" onClick={() => navigate("/")}>
          Volver
        </button>
        <div className="upload-card">
          <h2 className="upload-title">Subir Video</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Video (mp4)</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) =>
                  setVideoFile(e.target.files ? e.target.files[0] : null)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Thumbnail (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnailFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            <button className="upload-button" type="submit" disabled={isUploading}>
              {isUploading ? "Subiendo.." : "Subir Video"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default UploadVideoPage;