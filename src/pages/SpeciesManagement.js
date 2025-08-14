import React, { useState, useEffect } from 'react';
import api from '../api';

const SpeciesManagement = () => {
    const [species, setSpecies] = useState([]);
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [editSpeciesId, setEditSpeciesId] = useState(null);
    const [editSpeciesName, setEditSpeciesName] = useState('');

    useEffect(() => {
        fetchSpecies();
    }, []);

    const fetchSpecies = async () => {
        try {
            const response = await api.get('/species');
            setSpecies(response.data.data.species);
        } catch (error) {
            console.error('Error fetching species:', error);
        }
    };

    const handleAddSpecies = async () => {
        try {
            await api.post('/species', { species_name: newSpeciesName });
            setNewSpeciesName('');
            fetchSpecies();
        } catch (error) {
            console.error('Error adding species:', error);
        }
    };

    const handleEditSpecies = (species) => {
        setEditSpeciesId(species.species_id);
        setEditSpeciesName(species.species_name);
    };

    const handleUpdateSpecies = async () => {
        try {
            await api.put(`/species/${editSpeciesId}`, { species_name: editSpeciesName });
            setEditSpeciesId(null);
            setEditSpeciesName('');
            fetchSpecies();
        } catch (error) {
            console.error('Error updating species:', error);
        }
    };

    const handleDeleteSpecies = async (speciesId) => {
        try {
            await api.delete(`/species/${speciesId}`);
            fetchSpecies();
        } catch (error) {
            console.error('Error deleting species:', error);
        }
    };

    return (
        <div className="container">
            <h1>Управление видами питомцев</h1>
            <div className="card">
                <input
                    type="text"
                    placeholder="Название нового вида"
                    value={newSpeciesName}
                    onChange={(e) => setNewSpeciesName(e.target.value)}
                />
                <button onClick={handleAddSpecies}>Добавить вид</button>
            </div>
            <div className="card">
                <h2>Список видов</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {species.map((spec) => (
                            <tr key={spec.species_id}>
                                <td>{spec.species_id}</td>
                                <td>
                                    {editSpeciesId === spec.species_id ? (
                                        <input
                                            type="text"
                                            value={editSpeciesName}
                                            onChange={(e) => setEditSpeciesName(e.target.value)}
                                        />
                                    ) : (
                                        spec.species_name
                                    )}
                                </td>
                                <td>
                                    {editSpeciesId === spec.species_id ? (
                                        <>
                                            <button onClick={handleUpdateSpecies}>Сохранить</button>
                                            <button onClick={() => setEditSpeciesId(null)}>Отмена</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditSpecies(spec)}>Редактировать</button>
                                            <button onClick={() => handleDeleteSpecies(spec.species_id)}>Удалить</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpeciesManagement;
