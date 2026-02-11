import { Routes, Route } from "react-router-dom";
import VideoListPage from "./pages/VideoListPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VideoListPage />} />
      <Route path="/videos/:id" element={<VideoPlayerPage />} />
    </Routes>
  );
}

export default App;