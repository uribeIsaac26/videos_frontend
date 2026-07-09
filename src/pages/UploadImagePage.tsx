import { useState, useEffect, type FormEvent } from "react";
import { uploadImage } from "../api/ImageApi";
import { useNavigate } from "react-router-dom";


type UploadItem = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  imageId?: number;
  errorMessage?: string;
};


function UploadImagePage() {

  const [title, setTitle] = useState("");
  const [images, setImages] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const allSettled = images.every(v => v.status === "done" || v.status === "error");
    if (!allSettled) return;
    const errors = images.filter(v => v.status === "error").length;
    setFailedCount(errors);
    setUploadCompleted(true);
    if (errors === 0) {
      setImages([]);
      setTitle("");
    }
  }, [images]);

  const uploadSingleImage = async (item: UploadItem, index: number) => {
    try {
      setImages(prev =>
        prev.map((v, i) => i === index ? { ...v, status: "uploading" } : v)
      );

      const finalTitle = title || item.file.name.replace(/\.[^/.]+$/, "");

      const uploaded = await uploadImage(
        finalTitle,
        item.file,
        (percent) => {
          setImages(prev =>
            prev.map((v, i) => i === index ? { ...v, progress: percent } : v)
          );
        }
      );

      const imageId: number = uploaded.id;

      setImages(prev =>
        prev.map((v, i) =>
          i === index ? { ...v, status: "done", imageId, progress: 100 } : v
        )
      );
    } catch {
      setImages(prev =>
        prev.map((v, i) => i === index ? { ...v, status: "error" } : v)
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Debes seleccionar al menos una imagen");
      return;
    }

    setIsUploading(true);
    setUploadCompleted(false);
    setFailedCount(0);

    const MAX_CONCURRENT = 500;

    for (let i = 0; i < images.length; i += MAX_CONCURRENT) {
      const chunk = images.slice(i, i + MAX_CONCURRENT);
      await Promise.all(
        chunk.map((image, index) => uploadSingleImage(image, i + index))
      );
    }

    setIsUploading(false);
  };

  const statusLabel = (item: UploadItem) => {
    switch (item.status) {
      case "pending": return "Pendiente";
      case "uploading": return "Subiendo...";
      case "done": return "Listo";
      case "error": return item.errorMessage ? `Error: ${item.errorMessage}` : "Error";
    }
  };

  return (
    <>
      <div className="upload-page">
        <button className="back-button" onClick={() => navigate("/gallery")}>
          Volver
        </button>
        <div className="upload-card">
          <h2 className="upload-title">Subir Imagen</h2>
          {uploadCompleted && failedCount === 0 && (
            <div className="success-message">
              Todas las imágenes se subieron correctamente 🎉
            </div>
          )}
          {uploadCompleted && failedCount > 0 && (
            <div className="error-message">
              El proceso terminó pero fallaron {failedCount} {failedCount === 1 ? "imagen" : "imágenes"}
            </div>
          )}

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
              <label>Imagen</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.heif"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;

                  const filesArray: UploadItem[] = Array.from(e.target.files).map(file => ({
                    file,
                    progress: 0,
                    status: "pending"
                  }));

                  setImages(prev => [...prev, ...filesArray]);
                  setUploadCompleted(false);
                }}
                required
              />
            </div>

            <button className="upload-button" type="submit" disabled={isUploading}>
              {isUploading ? "Subiendo.." : "Subir Imagen"}
            </button>
          </form>
          {images.map((item, index) => (
            <div key={index} className="progress-item">
              <p>{item.file.name}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>

              <span>{item.progress}%</span>
              <span>{statusLabel(item)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default UploadImagePage;
