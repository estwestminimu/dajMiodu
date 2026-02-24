import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import CarsPage from "./pages/CarsPage.jsx";
import CarDetailPage from "./pages/CarDetailPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import "./styles.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<CarsPage />} />
            <Route path="cars/:id" element={<CarDetailPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
