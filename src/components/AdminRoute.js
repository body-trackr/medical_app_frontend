import React, { useEffect, useState } from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NotFound from './NotFound';
import { API_BASE_URL } from '../config';
import api from "../api";

const AdminRoute = ({ element: Component, ...rest }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await api.get(`${API_BASE_URL}/profiles/me`, { withCredentials: true });
                const permissions = response.data.data.permissions || {};
                setIsAdmin(permissions.admin === true);
            } catch (error) {
                console.error('Error fetching permissions:', error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAdmin) {
        return <Component {...rest} />;
    } else {
        return <NotFound />;
    }
};

export default AdminRoute;
