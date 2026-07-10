import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Words from "@/pages/Words";
import Origins from "@/pages/Origins";
import Saved from "@/pages/Saved";
import About from "@/pages/About";
import Auth from "@/pages/Auth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/words" element={<Words />} />
          <Route path="/origins" element={<Origins />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
