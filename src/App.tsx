import { Routes, Route } from "react-router-dom";
import VideoListPage from "./pages/VideoListPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import UploadVideoPage from "./pages/UploadVideoPage";
import Login from "./pages/Login";
import { PrivateRoute } from "./components/PrivateRoute";
import TagListPage from "./pages/TagListPage";
import CreateTagPage from "./pages/CreateTagPage";
import SugerenciasIAPage from "./pages/SugerenciasIAPage";

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
      <Route
        path="/tags"
        element=
        {
          <PrivateRoute>
            <TagListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tags/create"
        element=
        {
          <PrivateRoute>
            <CreateTagPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tags/sugess"
        element={
          <PrivateRoute>
            <SugerenciasIAPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;