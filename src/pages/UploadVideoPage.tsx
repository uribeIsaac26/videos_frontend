import { useState, useEffect, type FormEvent } from "react";
import { uploadVideo, getVideoStatus } from "../api/VideoApi";
import { useNavigate } from "react-router-dom";


type UploadItem = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  videoId?: number;
  errorMessage?: string;
};


function UploadVideoPage() {

  const [title, setTitle] = useState("");
  const [videos, setVideos] = useState<UploadItem[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    if (videos.length === 0) return;
    const allSettled = videos.every(v => v.status === "done" || v.status === "error");
    if (!allSettled) return;
    const errors = videos.filter(v => v.status === "error").length;
    setFailedCount(errors);
    setUploadCompleted(true);
    if (errors === 0) {
      setVideos([]);
      setTitle("");
      setThumbnailFile(null);
    }
  }, [videos]);

  const pollVideoStatus = async (videoId: number, index: number) => {
    while (true) {
      await new Promise(res => setTimeout(res, 5000));
      try {
        const result = await getVideoStatus(videoId);
        if (result.status === "LISTO") {
          setVideos(prev => prev.map((v, i) => i === index ? { ...v, status: "done" } : v));
          return;
        } else if (result.status === "ERROR") {
          setVideos(prev => prev.map((v, i) =>
            i === index ? { ...v, status: "error", errorMessage: result.errorMessage ?? undefined } : v
          ));
          return;
        }
      } catch {
        // error de red, reintenta en el siguiente intervalo
      }
    }
  };

  const uploadSingleVideo = async (item: UploadItem, index: number) => {
    try {
      setVideos(prev =>
        prev.map((v, i) => i === index ? { ...v, status: "uploading" } : v)
      );

      const finalTitle = title || item.file.name.replace(/\.[^/.]+$/, "");

      const uploaded = await uploadVideo(
        finalTitle,
        item.file,
        thumbnailFile,
        (percent) => {
          setVideos(prev =>
            prev.map((v, i) => i === index ? { ...v, progress: percent } : v)
          );
        }
      );

      const videoId: number = uploaded.id;

      setVideos(prev =>
        prev.map((v, i) =>
          i === index ? { ...v, status: "processing", videoId, progress: 100 } : v
        )
      );

      pollVideoStatus(videoId, index);
    } catch {
      setVideos(prev =>
        prev.map((v, i) => i === index ? { ...v, status: "error" } : v)
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (videos.length === 0) {
      alert("Debes seleccionar al menos un video");
      return;
    }

    setIsUploading(true);
    setUploadCompleted(false);
    setFailedCount(0);

    const MAX_CONCURRENT = 50;

    for (let i = 0; i < videos.length; i += MAX_CONCURRENT) {
      const chunk = videos.slice(i, i + MAX_CONCURRENT);
      await Promise.all(
        chunk.map((video, index) => uploadSingleVideo(video, i + index))
      );
    }

    setIsUploading(false);
  };

  const statusLabel = (item: UploadItem) => {
    switch (item.status) {
      case "pending": return "Pendiente";
      case "uploading": return "Subiendo...";
      case "processing": return "Procesando...";
      case "done": return "Listo";
      case "error": return item.errorMessage ? `Error: ${item.errorMessage}` : "Error";
    }
  };

  return (
    <>
      <div className="upload-page">
        <button className="back-button" onClick={() => navigate("/")}>
          Volver
        </button>
        <div className="upload-card">
          <h2 className="upload-title">Subir Video</h2>
          {uploadCompleted && failedCount === 0 && (
            <div className="success-message">
              Todos los videos se procesaron correctamente 🎉
            </div>
          )}
          {uploadCompleted && failedCount > 0 && (
            <div className="error-message">
              El proceso terminó pero fallaron {failedCount} {failedCount === 1 ? "video" : "videos"}
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
              <label>Video</label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;

                  const filesArray: UploadItem[] = Array.from(e.target.files).map(file => ({
                    file,
                    progress: 0,
                    status: "pending"
                  }));

                  setVideos(prev => [...prev, ...filesArray]);
                  setUploadCompleted(false);
                }}
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
          {videos.map((item, index) => (
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

export default UploadVideoPage;
