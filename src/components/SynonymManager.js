import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from './Modal';

const SynonymManager = ({ testId, onClose }) => {
    const [synonyms, setSynonyms] = useState([]);
    const [newSynonym, setNewSynonym] = useState('');
    const [editSynonymId, setEditSynonymId] = useState(null);
    const [isPrimary, setIsPrimary] = useState(false);

    // Загружаем список синонимов при инициализации
    useEffect(() => {
        fetchSynonyms();
    }, []);

    // Функция для получения списка синонимов
    const fetchSynonyms = async () => {
        try {
            const response = await api.get(`/tests/${testId}/synonyms`);
            setSynonyms(response.data.data);
        } catch (error) {
            console.error('Error fetching synonyms:', error);
        }
    };

    // Функция для создания или обновления синонима
    const handleCreateOrUpdateSynonym = async () => {
        try {
            const data = { synonym_name: newSynonym, is_primary: isPrimary };
            if (editSynonymId) {
                await api.put(`/synonyms/${editSynonymId}`, data);
            } else {
                await api.post(`/tests/${testId}/synonyms`, data);
            }
            setNewSynonym('');
            setIsPrimary(false);
            setEditSynonymId(null);
            fetchSynonyms(); // Обновляем список после изменений
        } catch (error) {
            console.error('Error saving synonym:', error);
        }
    };

    // Функция для удаления синонима
    const handleDeleteSynonym = async (synonymId) => {
        try {
            await api.delete(`/synonyms/${synonymId}`);
            fetchSynonyms(); // Обновляем список после удаления
        } catch (error) {
            console.error('Error deleting synonym:', error);
        }
    };

    // Функция для начала редактирования синонима
    const handleEditSynonym = (synonym) => {
        setNewSynonym(synonym.synonym_name);
        setIsPrimary(synonym.is_primary);
        setEditSynonymId(synonym.synonym_id);
    };

    return (
        <Modal onClose={onClose}>
            <h2>Управление синонимами</h2>
            <div className="card">
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
                    Основной синоним
                </label>
                <button onClick={handleCreateOrUpdateSynonym}>
                    {editSynonymId ? 'Обновить синоним' : 'Создать синоним'}
                </button>
            </div>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название синонима</th>
                            <th>Основной</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {synonyms.map((synonym) => (
                            <tr key={synonym.synonym_id}>
                                <td>{synonym.synonym_id}</td>
                                <td>{synonym.synonym_name}</td>
                                <td>{synonym.is_primary ? 'Да' : 'Нет'}</td>
                                <td>
                                    <button onClick={() => handleEditSynonym(synonym)}>Редактировать</button>
                                    <button onClick={() => handleDeleteSynonym(synonym.synonym_id)}>Удалить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default SynonymManager;
