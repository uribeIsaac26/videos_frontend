import { useState } from "react";
import { uploadVideo } from "../api/VideoApi";
import { useNavigate } from "react-router-dom";


type UploadItem = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};


function UploadVideoPage() {

  const [title, setTitle] = useState("");
  const [videos, setVideos] = useState<UploadItem[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [uploadCompleted, setUploadCompleted] = useState(false);


  const uploadSingleVideo = async (item: UploadItem, index: number) => {
    try {
      setVideos(prev =>
        prev.map((v, i) =>
          i === index ? { ...v, status: "uploading" } : v
        )
      );

      const finalTitle =
        title || item.file.name.replace(/\.[^/.]+$/, "");

      await uploadVideo(
        finalTitle,
        item.file,
        thumbnailFile,
        (percent) => {
          setVideos(prev =>
            prev.map((v, i) =>
              i === index ? { ...v, progress: percent } : v
            )
          );
        }
      );

      setVideos(prev =>
        prev.map((v, i) =>
          i === index ? { ...v, status: "done", progress: 100 } : v
        )
      );
    } catch {
      setVideos(prev =>
        prev.map((v, i) =>
          i === index ? { ...v, status: "error" } : v
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (videos.length === 0) {
      alert("Debes seleccionar al menos un video");
      return;
    }

    setIsUploading(true);

    const MAX_CONCURRENT = 5;

    for (let i = 0; i < videos.length; i += MAX_CONCURRENT) {
      const chunk = videos.slice(i, i + MAX_CONCURRENT);

      await Promise.all(
        chunk.map((video, index) =>
          uploadSingleVideo(video, i + index)
        )
      );
    }

    const hasErrors = videos.some(v => v.status === "error");

    if (!hasErrors) {
      setUploadCompleted(true);
      setVideos([]); // limpiar lista
      setTitle("");
      setThumbnailFile(null);
    } else {
      alert("Algunos videos fallaron ❌");
    }
    setIsUploading(false);
  };

  return (
    <>
      <div className="upload-page">
        <button className="back-button" onClick={() => navigate("/")}>
          Volver
        </button>
        <div className="upload-card">
          <h2 className="upload-title">Subir Video</h2>
          {uploadCompleted && (
            <div className="success-message">
              Todos los videos se subieron correctamente 🎉
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
              <label>Video (mp4)</label>
              <input
                type="file"
                accept="video/mp4"
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
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default UploadVideoPage;