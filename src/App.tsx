import { Routes, Route } from "react-router-dom";
import VideoListPage from "./pages/VideoListPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import UploadVideoPage from "./pages/UploadVideoPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VideoListPage />} />
      <Route path="/videos/:id" element={<VideoPlayerPage />} />
      <Route path="/upload" element={<UploadVideoPage />} />
    </Routes>
  );
}

export default App;