import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Register from './pages/Register';
import MyTests from './pages/MyTests';
import Admin from './pages/Admin';
import Tests from './pages/Tests';
import EditTest from './pages/EditTest';
import Genders from './pages/Genders';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Импортируем новый компонент
import ProfileWizard from './components/ProfileWizard';
import './App.css';
import api from "./api";
import SpeciesManagement from "./pages/SpeciesManagement";
import { API_BASE_URL } from "./config";
import NotFound from "./components/NotFound";
import Synonyms from "./pages/Synonyms";
import Files from "./pages/Files";
import FileDetails from "./pages/FileDetails";
import MyFiles from "./pages/MyFiles";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [needsProfile, setNeedsProfile] = useState(false);
    const [needsConsent, setNeedsConsent] = useState(false);

    useEffect(() => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            setIsAuthenticated(true);
            checkUserProfile();
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    const checkUserProfile = async () => {
        try {
            const response = await api.get('/profiles/me');
            setNeedsProfile(response.data.data.needs_profile);
            setNeedsConsent(response.data.data.needs_consent);
            setIsLoading(false);
        } catch (error) {
            console.error('Error checking user profile:', error);
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('refresh_token');
        axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
    };

    const handleAuthenticated = () => {
        setIsAuthenticated(true);
        checkUserProfile();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (needsProfile || needsConsent) {
        return <ProfileWizard onComplete={() => { setNeedsProfile(false); setNeedsConsent(false); }} />;
    }

    return (
        <Router>
            <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            <Routes>
                <Route path="/register" element={<Register onAuthenticated={handleAuthenticated} />} />
                <Route
                    path="/my-tests"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <MyTests />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={Admin} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/tests"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={Tests} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/tests/:testId"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={EditTest} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/species"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={SpeciesManagement} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/genders"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={Genders} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/synonyms"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={Synonyms} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/files"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={Files} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/files/:fileId/details"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <AdminRoute element={FileDetails} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-files"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <MyFiles />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={isAuthenticated ? <Navigate to="/my-tests" /> : <Register onAuthenticated={handleAuthenticated} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
