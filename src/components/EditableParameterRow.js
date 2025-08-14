// frontend/src/components/EditableParameterRow.js

import React, { useState, useEffect } from 'react';
import ReferenceModal from './ReferenceModal';
import SelectValuesModal from './SelectValuesModal';
import UnitModal from './UnitModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCheck, faTimes, faCog, faList, faPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../api';

const EditableParameterRow = ({ parameter, index, onUpdate, onDelete, isNew, onCancelAdd }) => {
    const [isEditing, setIsEditing] = useState(isNew);
    const [editedParameter, setEditedParameter] = useState({ ...parameter });
    const [showReferenceModal, setShowReferenceModal] = useState(false);
    const [showSelectValuesModal, setShowSelectValuesModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedParameter({ ...parameter });
    };

    const handleSaveEdit = async () => {
        try {
            // Формируем payload только с нужными полями
            const payload = {
                parameter_name: editedParameter.parameter_name,
                parameter_type: editedParameter.parameter_type,
                unit: editedParameter.unit,
                molar_mass: editedParameter.molar_mass
            };

            if (isNew) {
                // Для нового параметра добавляем test_id:
                await api.post('/test-parameters', {
                    ...payload,
                    test_id: parameter.test_id
                });
                onCancelAdd();
            } else {
                // PUT-запрос — передаём только нужные поля
                await api.put(`/test-parameters/${editedParameter.parameter_id}`, payload);
            }

            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving parameter:', error);
        }
    };

    const handleChange = (key, value) => {
        setEditedParameter((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <tr>
                {isEditing ? (
                    <>
                        <td>
                            <input
                                type="text"
                                value={editedParameter.parameter_name}
                                onChange={(e) => handleChange('parameter_name', e.target.value)}
                            />
                        </td>
                        <td>
                            {editedParameter.parameter_type === 'concentration' ? (
                                <button onClick={() => setShowUnitModal(true)}>Настроить единицы</button>
                            ) : (
                                <input
                                    type="text"
                                    value={editedParameter.unit}
                                    onChange={(e) => handleChange('unit', e.target.value)}
                                />
                            )}
                        </td>
                        <td>
                            <select
                                value={editedParameter.parameter_type}
                                onChange={(e) => handleChange('parameter_type', e.target.value)}
                            >
                                <option value="numeric">Числовой</option>
                                <option value="select_one">Значение из списка</option>
                                <option value="concentration">Концентрация</option>
                            </select>
                            {editedParameter.parameter_type === 'concentration' && (
                                <input
                                    type="number"
                                    placeholder="Молярная масса, г/моль"
                                    value={editedParameter.molar_mass || ''}
                                    onChange={(e) => handleChange('molar_mass', e.target.value)}
                                />
                            )}
                        </td>
                        <td>
                            <button onClick={() => setShowReferenceModal(true)}>
                                <FontAwesomeIcon icon={faCog} />
                            </button>
                            {editedParameter.parameter_type === 'select_one' && (
                                <button onClick={() => setShowSelectValuesModal(true)}>
                                    <FontAwesomeIcon icon={faList} />
                                </button>
                            )}
                        </td>
                        <td>
                            <button onClick={handleSaveEdit}>
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button onClick={isNew ? onCancelAdd : handleCancelEdit}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </td>
                    </>
                ) : (
                    <>
                        <td>{parameter.parameter_name}</td>
                        <td>
                            {parameter.units.length > 0 ? (
                                parameter.units.map((u) => (
                                    <li key={u.unit_id}>
                                        {u.unit_name}
                                        {u.is_default ? ' *' : ''}
                                    </li>
                                ))
                            ) : (
                                '-'
                            )}
                        </td>
                        <td>{parameter.parameter_type}</td>
                        <td></td>
                        <td>
                            <button onClick={handleEditClick}>
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button onClick={() => onDelete(parameter.parameter_id)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </td>
                    </>
                )}
            </tr>
            {showReferenceModal && (
                <ReferenceModal
                    parameter={parameter}
                    onClose={() => setShowReferenceModal(false)}
                />
            )}
            {showSelectValuesModal && (
                <SelectValuesModal
                    parameter={parameter}
                    onClose={() => setShowSelectValuesModal(false)}
                />
            )}
            {showUnitModal && (
                <UnitModal
                    parameter={parameter}
                    onClose={() => setShowUnitModal(false)}
                />
            )}
        </>
    );
};

export default EditableParameterRow;
