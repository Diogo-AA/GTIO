import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./router/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import GalasPage from "./pages/GalasPage";
import VotarPage from "./pages/VotarPage";
import UsuariosPage from "./pages/UsuariosPage";
import PerfilPage from "./pages/PerfilPage";
import Toast from "./components/Toast";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/galas" element={<GalasPage />} />
          <Route path="/galas/:id" element={<VotarPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/galas" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
}
