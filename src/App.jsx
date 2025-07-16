import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';

// Import stron i komponentów
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CreateProfilePage from './pages/CreateProfilePage.jsx';
import TruckDetailsPage from './pages/TruckDetailsPage.jsx';
import BookingPage from './pages/BookingPage.jsx';

// ZMIANA: Import nowych komponentów czatu
import ChatLayout from './pages/ChatLayout.jsx';
import ConversationView from './pages/ConversationView.jsx';

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
            <Route path="/profile/:profileId" element={<TruckDetailsPage />} />

            {/* Trasy chronione */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/create-profile" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            <Route path="/edit-profile/:profileId" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            <Route path="/booking/:profileId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            
            {/* ZMIANA: Nowa, zagnieżdżona struktura tras dla czatu */}
            <Route path="/chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
              <Route path=":conversationId" element={<ConversationView />} />
            </Route>

          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;