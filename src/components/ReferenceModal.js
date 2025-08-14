// frontend/src/components/ReferenceModal.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/ReferenceModal.css';
import ReferenceValueItem from './ReferenceValueItem';

const ReferenceModal = ({ parameter, onClose }) => {
    const [referenceValues, setReferenceValues] = useState([]);
    const [species, setSpecies] = useState([]);
    const [genders, setGenders] = useState([]);
    const [selectValues, setSelectValues] = useState([]);
    const [activeSpecies, setActiveSpecies] = useState('any');
    const [newReferenceValue, setNewReferenceValue] = useState({
        parameter_id: parameter.parameter_id,
        species_id: null,
        gender_id: null,
        min_age: null,
        max_age: null,
        min_value: null,
        max_value: null,
        select_value_id: null,
        reference_id: null
    });

    useEffect(() => {
        fetchReferenceValues();
        fetchSpecies();
        fetchGenders();
        fetchSelectValues();
    }, []);

    const fetchReferenceValues = async () => {
        try {
            const response = await api.get(`/test-parameters/${parameter.parameter_id}/reference-values`);
            setReferenceValues(response.data.data.reference_values);
        } catch (error) {
            console.error('Error fetching reference values:', error);
        }
    };

    const fetchSpecies = async () => {
        try {
            const response = await api.get('/species');
            setSpecies(response.data.data.species);
        } catch (error) {
            console.error('Error fetching species:', error);
        }
    };

    const fetchGenders = async () => {
        try {
            const response = await api.get('/genders');
            setGenders(response.data.data.genders);
        } catch (error) {
            console.error('Error fetching genders:', error);
        }
    };

    const fetchSelectValues = async () => {
        try {
            const response = await api.get(`/test-parameters/${parameter.parameter_id}/select-values`);
            setSelectValues(response.data.data.select_values);
        } catch (error) {
            console.error('Error fetching select values:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewReferenceValue((prev) => ({
            ...prev,
            [name]: value ? parseFloat(value) : null
        }));
    };

    const handleChangeSelect = (e) => {
        const { name, value } = e.target;
        setNewReferenceValue((prev) => ({
            ...prev,
            [name]: value ? parseInt(value) : null
        }));
    };

    const handleAddReferenceValue = async () => {
        try {
            if (newReferenceValue.reference_id) {
                await api.put(`/reference-values/${newReferenceValue.reference_id}`, newReferenceValue);
            } else {
                await api.post('/reference-values', newReferenceValue);
            }
            fetchReferenceValues();
            resetForm();
        } catch (error) {
            console.error('Error adding or updating reference value:', error);
        }
    };

    const handleEditReferenceValue = (referenceValue) => {
        setNewReferenceValue(referenceValue);
    };

    const handleDeleteReferenceValue = async (referenceId) => {
        try {
            await api.delete(`/reference-values/${referenceId}`);
            fetchReferenceValues();
        } catch (error) {
            console.error('Error deleting reference value:', error);
        }
    };

    const handleTabClick = (speciesId) => {
        setActiveSpecies(speciesId);
    };

    const filteredReferenceValues = activeSpecies === 'any'
        ? referenceValues.filter((refValue) => refValue.species_id === null)
        : referenceValues.filter((refValue) => refValue.species_id === activeSpecies);

    const resetForm = () => {
        setNewReferenceValue({
            parameter_id: parameter.parameter_id,
            species_id: null,
            gender_id: null,
            min_age: null,
            max_age: null,
            min_value: null,
            max_value: null,
            select_value_id: null,
            reference_id: null
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Настройка референсных значений для параметра: {parameter.parameter_name}</h2>
                <div className="tabs">
                    <button
                        className={activeSpecies === 'any' ? 'active' : ''}
                        onClick={() => handleTabClick('any')}
                    >
                        Любой
                    </button>
                    {species.map((s) => (
                        <button
                            key={s.species_id}
                            className={activeSpecies === s.species_id ? 'active' : ''}
                            onClick={() => handleTabClick(s.species_id)}
                        >
                            {s.species_name}
                        </button>
                    ))}
                </div>
                <div className="reference-values">
                    {filteredReferenceValues.map((refValue) => (
                        <ReferenceValueItem
                            key={refValue.reference_id}
                            referenceValue={refValue}
                            species={species}
                            genders={genders}
                            selectValues={selectValues}
                            onEdit={handleEditReferenceValue}
                            onDelete={handleDeleteReferenceValue}
                        />
                    ))}
                </div>
                <div className="add-reference-value">
                    <h3>{newReferenceValue.reference_id ? 'Редактировать референсное значение' : 'Добавить новое референсное значение'}</h3>
                    <div>
                        <label>Вид:</label>
                        <select name="species_id" value={newReferenceValue.species_id || ''} onChange={handleChangeSelect}>
                            <option value="">Любой</option>
                            {species.map((s) => (
                                <option key={s.species_id} value={s.species_id}>
                                    {s.species_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Пол:</label>
                        <select name="gender_id" value={newReferenceValue.gender_id || ''} onChange={handleChangeSelect}>
                            <option value="">Любой</option>
                            {genders.map((g) => (
                                <option key={g.gender_id} value={g.gender_id}>
                                    {g.gender_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Возраст (лет):</label>
                        <input
                            type="number"
                            step="0.1"
                            name="min_age"
                            placeholder="От"
                            value={newReferenceValue.min_age || ''}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            step="0.1"
                            name="max_age"
                            placeholder="До"
                            value={newReferenceValue.max_age || ''}
                            onChange={handleChange}
                        />
                    </div>
                    {(parameter.parameter_type === 'numeric' || parameter.parameter_type === 'concentration') ? (
                        <div>
                            <label>Значение:</label>
                            <input
                                type="number"
                                step="0.1"
                                name="min_value"
                                placeholder="Минимум"
                                value={newReferenceValue.min_value || ''}
                                onChange={handleChange}
                            />
                            <input
                                type="number"
                                step="0.1"
                                name="max_value"
                                placeholder="Максимум"
                                value={newReferenceValue.max_value || ''}
                                onChange={handleChange}
                            />
                        </div>
                    ) : (
                        <div>
                            <label>Значение:</label>
                            <select
                                name="select_value_id"
                                value={newReferenceValue.select_value_id || ''}
                                onChange={handleChangeSelect}
                            >
                                <option value="">Любое</option>
                                {selectValues.map((sv) => (
                                    <option key={sv.select_id} value={sv.select_id}>
                                        {sv.select_value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button className="add-button" onClick={handleAddReferenceValue}>
                        {newReferenceValue.reference_id ? 'Обновить' : 'Добавить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReferenceModal;
