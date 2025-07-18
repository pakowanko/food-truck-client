// components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <p>Sprawdzanie autoryzacji...</p>;
    }

    if (user && user.role === 'admin') {
        return children;
    }

    // Jeśli użytkownik nie jest adminem, przekieruj go na stronę główną
    return <Navigate to="/" replace />;
};

export default AdminRoute;