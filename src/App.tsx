import { Routes, Route } from "react-router-dom";
import VideoListPage from "./pages/VideoListPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import UploadVideoPage from "./pages/UploadVideoPage";
import Login from "./pages/Login";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <VideoListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/videos/:id"
        element={
          <PrivateRoute>
            <VideoPlayerPage />
          </PrivateRoute>
        }
      />
      <Route path="/upload"
        element=
        {
          <PrivateRoute>
            <UploadVideoPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;