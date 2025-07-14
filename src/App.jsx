// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';

// ZMIANA: Poprawione ścieżki importu
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CreateProfilePage from './pages/CreateProfilePage.jsx';
import TruckDetailsPage from './pages/TruckDetailsPage.jsx';
import BookingPage from './pages/BookingPage.jsx'; // Dodajemy import dla strony rezerwacji

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            {/* Trasy publiczne */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* ZMIANA: Używamy nowego komponentu TruckDetailsPage */}
            <Route path="/profile/:profileId" element={<TruckDetailsPage />} />

            {/* Trasy chronione */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/create-profile" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            
            {/* ZMIANA: Poprawka trasy do edycji profilu */}
            <Route path="/edit-profile/:profileId" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />

            {/* ZMIANA: Dodajemy nową trasę dla strony rezerwacji */}
            <Route path="/booking/:profileId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;