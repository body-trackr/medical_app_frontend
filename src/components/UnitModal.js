// frontend/src/components/UnitModal.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/UnitModal.css';

const UnitModal = ({ parameter, onClose }) => {
    const [units, setUnits] = useState([]);
    const [config, setConfig] = useState({
        units_numerator: {},
        units_denominator: {},
        units_whole: []
    });
    const [mode, setMode] = useState('fraction'); // 'fraction' или 'whole'
    const [newUnit, setNewUnit] = useState({
        numerator: '',
        denominator: '',
        whole: '',
        is_default: false
    });

    useEffect(() => {
        fetchUnits();
        fetchConfig();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await api.get(`/test-parameters/${parameter.parameter_id}/units`);
            setUnits(response.data.data.units);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await api.get('/units/config');
            setConfig({
                units_numerator: response.data.units_numerator,
                units_denominator: response.data.units_denominator,
                units_whole: response.data.units_whole || []
            });
        } catch (error) {
            console.error('Error fetching units config:', error);
        }
    };

    const handleAddUnit = async () => {
        let unitName = '';
        if (mode === 'fraction') {
            unitName = `${newUnit.numerator}/${newUnit.denominator}`;
        } else {
            unitName = newUnit.whole; // 'DOB (‰)', напр.
        }

        try {
            await api.post(`/test-parameters/${parameter.parameter_id}/units`, {
                unit_name: unitName,
                is_default: newUnit.is_default
            });
            setNewUnit({ numerator: '', denominator: '', is_default: false });
            fetchUnits();
        } catch (error) {
            console.error('Error adding unit:', error);
        }
    };

    const handleDeleteUnit = async (unitId) => {
        try {
            await api.delete(`/test-parameters/units/${unitId}`);
            fetchUnits();
        } catch (error) {
            console.error('Error deleting unit:', error);
        }
    };

    const handleDefaultChange = async (unitId) => {
        try {
            await api.put(`/test-parameters/units/${unitId}`, { is_default: true });
            fetchUnits();
        } catch (error) {
            console.error('Error setting default unit:', error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Настройка единиц измерения для: {parameter.parameter_name}</h2>

                {/* Выбор режима: целая / дробная */}
                <div>
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            value="fraction"
                            checked={mode === 'fraction'}
                            onChange={() => setMode('fraction')}
                        />
                        Дробная единица
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            value="whole"
                            checked={mode === 'whole'}
                            onChange={() => setMode('whole')}
                        />
                        Целая единица
                    </label>
                </div>

                {mode === 'fraction' && (
                    <div className="fraction-block">
                        <select
                            value={newUnit.numerator}
                            onChange={(e) => setNewUnit({...newUnit, numerator: e.target.value})}
                        >
                            <option value="">Числитель</option>
                            {Object.entries(config.units_numerator).map(([group, units]) => (
                                <optgroup label={group} key={group}>
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <span>/</span>
                        <select
                            value={newUnit.denominator}
                            onChange={(e) => setNewUnit({...newUnit, denominator: e.target.value})}
                        >
                            <option value="">Знаменатель</option>
                            {Object.entries(config.units_denominator).map(([group, units]) => (
                                <optgroup label={group} key={group}>
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'whole' && (
                    <div className="whole-block">
                        <select
                            value={newUnit.whole}
                            onChange={(e) => setNewUnit({...newUnit, whole: e.target.value})}
                        >
                            <option value="">Выберите целую единицу</option>
                            {config.units_whole.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                )}

                <label>
                    <input
                        type="checkbox"
                        checked={newUnit.is_default}
                        onChange={(e) => setNewUnit({...newUnit, is_default: e.target.checked})}
                    />
                    Сделать дефолтной
                </label>
                <button onClick={handleAddUnit}>Добавить</button>
                
                <div className="units-list">
                    <ul>
                        {units.map((unit) => (
                            <li key={unit.unit_id}>
                                {unit.unit_name} {unit.is_default && '(дефолт)'}
                                {!unit.is_default && (
                                    <button onClick={() => handleDefaultChange(unit.unit_id)}>
                                        Сделать дефолтной
                                    </button>
                                )}
                                <button onClick={() => handleDeleteUnit(unit.unit_id)}>
                                    Удалить
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                </div>
            </div>
            );
            };

            export default UnitModal;
