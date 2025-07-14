import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';

// Import stron i komponentów
import HomePage from './HomePage.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import ChatPage from './ChatPage.jsx';
import Navbar from './Navbar.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import CreateProfilePage from './CreateProfilePage.jsx';
import ProfileDetailsPage from './ProfileDetailsPage.jsx';

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
            <Route path="/profile/:profileId" element={<ProfileDetailsPage />} />
            <Route path="/booking/:profileId" element={<BookingPage />} />

            {/* Trasy chronione */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/create-profile" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            
            {/* NOWA TRASA DO EDYCJI PROFILU */}
            <Route path="/edit-profile/:profileId" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />

          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;