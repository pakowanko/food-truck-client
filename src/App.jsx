import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext, NotificationPopup } from './AuthContext.jsx';

// Import komponentów
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Import stron
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateProfilePage from './pages/CreateProfilePage.jsx';
import TruckDetailsPage from './pages/TruckDetailsPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import ChatLayout from './pages/ChatLayout.jsx';
import ConversationView from './pages/ConversationView.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MyAccountPage from './pages/MyAccountPage.jsx';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

// Komponent pomocniczy do zarządzania powiadomieniami wewnątrz Routera
const NotificationManager = () => {
  const { notification, setNotification } = useContext(AuthContext);
  if (!notification) return null;
  return <NotificationPopup notification={notification} onClose={() => setNotification(null)} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationManager />
        <Navbar />
        <main>
          <Routes>
            {/* Trasy publiczne */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile/:profileId" element={<TruckDetailsPage />} />
            <Route path="/regulamin" element={<TermsPage />} />
            <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />

            {/* Trasy chronione */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/create-profile" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            <Route path="/edit-profile/:profileId" element={<ProtectedRoute><CreateProfilePage /></ProtectedRoute>} />
            <Route path="/booking/:profileId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
         
            {/* Trasa tylko dla admina */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

            {/* Zagnieżdżona trasa dla czatu */}
            <Route path="/chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
              <Route path=":conversationId" element={<ConversationView />} />
            </Route>

          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
