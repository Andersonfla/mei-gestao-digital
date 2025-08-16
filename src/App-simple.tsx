import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext-simple";
import LandingPage from "./pages/LandingPage";
import Support from "./pages/Support";

const App = () => {
  console.log('App component rendering, React:', React);
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/suporte" element={<Support />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;