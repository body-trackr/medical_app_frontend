// frontend/src/components/SynonymsModal.js

import React, { useState, useEffect } from 'react';
import api from '../api';

const SynonymsModal = ({ testId }) => {
    const [synonyms, setSynonyms] = useState([]);
    const [newSynonym, setNewSynonym] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        fetchSynonyms();
    }, [testId]);

    const fetchSynonyms = async () => {
        try {
            const response = await api.get(`/tests/${testId}/synonyms`);
            setSynonyms(response.data.data.synonyms);
        } catch (error) {
            console.error('Error fetching synonyms:', error);
        }
    };

    const handleCreateSynonym = async () => {
        try {
            const data = { synonym_name: newSynonym, is_primary: isPrimary, confirmed: isConfirmed };
            await api.post(`/tests/${testId}/synonyms`, data);
            setNewSynonym('');
            setIsPrimary(false);
            setIsConfirmed(false);
            fetchSynonyms();  // Обновляем список синонимов после добавления
        } catch (error) {
            console.error('Error creating synonym:', error);
        }
    };

    const handleDeleteSynonym = async (synonymId) => {
        try {
            await api.delete(`/synonyms/${synonymId}`);
            fetchSynonyms();  // Обновляем список синонимов после удаления
        } catch (error) {
            console.error('Error deleting synonym:', error);
        }
    };

    return (
        <div>
            <h2>Синонимы для анализа</h2>
            <ul>
                {synonyms.map(synonym => (
                    <li key={synonym.synonym_id}>
                        {synonym.synonym_name} (Primary: {synonym.is_primary ? 'Yes' : 'No'}, Confirmed: {synonym.confirmed ? 'Yes' : 'No'})
                        <button onClick={() => handleDeleteSynonym(synonym.synonym_id)}>Удалить</button>
                    </li>
                ))}
            </ul>

            <div>
                <h3>Добавить новый синоним</h3>
                <input
                    type="text"
                    placeholder="Название синонима"
                    value={newSynonym}
                    onChange={(e) => setNewSynonym(e.target.value)}
                />
                <label>
                    <input
                        type="checkbox"
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                    />
                    Основной
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                    />
                    Подтвержденный
                </label>
                <button onClick={handleCreateSynonym}>Создать</button>
            </div>
        </div>
    );
};

export default SynonymsModal;
