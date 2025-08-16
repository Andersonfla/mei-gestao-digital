import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Support from "./pages/Support";

const App = () => {
  console.log('App component rendering, React:', React);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/suporte" element={<Support />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;