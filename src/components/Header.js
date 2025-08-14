import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Header.css';
import { API_BASE_URL } from '../config'; // Импортируем базовый URL API из конфигурационного файла

const Header = ({ isAuthenticated, onLogout }) => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/profiles/me`, { withCredentials: true });
                setPermissions(response.data.data.permissions);
            } catch (error) {
                console.error('Error fetching user permissions:', error);
            }
        };

        if (isAuthenticated) {
            fetchPermissions();
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
            localStorage.removeItem('refresh_token'); // Удаляем refresh_token из localStorage
            onLogout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item"><Link className="nav-link" to="/my-tests">Мои анализы</Link></li>
                    {permissions.import_files && (
                        <li className="nav-item"><Link className="nav-link" to="/my-files">Мои файлы</Link></li>
                    )}
                    {permissions.admin && (
                        <li className="nav-item"><Link className="nav-link" to="/admin">Админка</Link></li>
                    )}
                    <li className="nav-item"><button className="nav-button" onClick={handleLogout}>Выйти</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
