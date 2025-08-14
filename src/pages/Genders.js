// frontend/src/pages/Genders.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/Genders.css';

const Genders = () => {
    const [genders, setGenders] = useState([]);
    const [newGender, setNewGender] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editGenderId, setEditGenderId] = useState(null);
    const [editGenderName, setEditGenderName] = useState('');

    useEffect(() => {
        fetchGenders();
    }, []);

    const fetchGenders = async () => {
        try {
            const response = await api.get('/genders');
            setGenders(response.data.data.genders);
        } catch (error) {
            console.error('Error fetching genders:', error);
        }
    };

    const handleAddGender = async () => {
        try {
            await api.post('/genders', { gender_name: newGender });
            setNewGender('');
            fetchGenders();
        } catch (error) {
            console.error('Error adding gender:', error);
        }
    };

    const handleEditGender = (gender) => {
        setIsEditing(true);
        setEditGenderId(gender.gender_id);
        setEditGenderName(gender.gender_name);
    };

    const handleUpdateGender = async () => {
        try {
            await api.put(`/genders/${editGenderId}`, { gender_name: editGenderName });
            setIsEditing(false);
            setEditGenderId(null);
            setEditGenderName('');
            fetchGenders();
        } catch (error) {
            console.error('Error updating gender:', error);
        }
    };

    const handleDeleteGender = async (genderId) => {
        try {
            await api.delete(`/genders/${genderId}`);
            fetchGenders();
        } catch (error) {
            console.error('Error deleting gender:', error);
        }
    };

    return (
        <div className="container">
            <h1>Управление полами</h1>
            <div className="card">
                {isEditing ? (
                    <div className="edit-container">
                        <input
                            type="text"
                            value={editGenderName}
                            onChange={(e) => setEditGenderName(e.target.value)}
                        />
                        <button onClick={handleUpdateGender}>Сохранить</button>
                        <button onClick={() => setIsEditing(false)}>Отмена</button>
                    </div>
                ) : (
                    <div className="add-container">
                        <input
                            type="text"
                            placeholder="Название пола"
                            value={newGender}
                            onChange={(e) => setNewGender(e.target.value)}
                        />
                        <button onClick={handleAddGender}>Добавить</button>
                    </div>
                )}
            </div>
            <div className="card">
                <h2>Список полов</h2>
                <ul>
                    {genders.map((gender) => (
                        <li key={gender.gender_id}>
                            {gender.gender_name}
                            <button onClick={() => handleEditGender(gender)}>Редактировать</button>
                            <button onClick={() => handleDeleteGender(gender.gender_id)}>Удалить</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Genders;
