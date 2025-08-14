// frontend/src/components/SelectValuesModal.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/SelectValuesModal.css';

const SelectValuesModal = ({ parameter, onClose }) => {
    const [selectValues, setSelectValues] = useState([]);
    const [newSelectValue, setNewSelectValue] = useState('');

    useEffect(() => {
        fetchSelectValues();
    }, []);

    const fetchSelectValues = async () => {
        try {
            const response = await api.get(`/test-parameters/${parameter.parameter_id}/select-values`);
            setSelectValues(response.data.data.select_values);
        } catch (error) {
            console.error('Error fetching select values:', error);
        }
    };

    const handleAddSelectValue = async () => {
        try {
            await api.post(`/test-parameters/${parameter.parameter_id}/select-values`, { select_value: newSelectValue });
            setNewSelectValue('');
            fetchSelectValues();
        } catch (error) {
            console.error('Error adding select value:', error);
        }
    };

    const handleDeleteSelectValue = async (selectValueId) => {
        try {
            await api.delete(`/test-parameters/select-values/${selectValueId}`);
            fetchSelectValues();
        } catch (error) {
            console.error('Error deleting select value:', error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Управление значениями для параметра: {parameter.parameter_name}</h2>
                <div className="select-values">
                    <ul>
                        {selectValues.map((selectValue) => (
                            <li key={selectValue.select_id}>
                                <span>{selectValue.select_value}</span>
                                <button onClick={() => handleDeleteSelectValue(selectValue.select_id)}>Удалить</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="add-select-value">
                    <input
                        type="text"
                        placeholder="Новое значение"
                        value={newSelectValue}
                        onChange={(e) => setNewSelectValue(e.target.value)}
                    />
                    <button onClick={handleAddSelectValue}>Добавить</button>
                </div>
            </div>
        </div>
    );
};

export default SelectValuesModal;
