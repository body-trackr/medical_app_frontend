import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        console.log('Redirecting to /register because user is not authenticated');
        return <Navigate to="/register" />;
    }
    return children;
};

export default ProtectedRoute;
