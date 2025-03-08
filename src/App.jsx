// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ShipList from "./pages/ShipList";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CustomDashboard from "./pages/CustomDashboard";
import ShipDetails from "./pages/ShipDetails";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<CustomDashboard />} />
          <Route path="/ship/:file_id" element={<ShipDetails />} />
          <Route path="/ships" element={<ShipList />} />
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
