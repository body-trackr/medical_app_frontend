// frontend/src/components/ReferenceValueItem.js

import React from 'react';

const ReferenceValueItem = ({ referenceValue, species, genders, selectValues, onEdit, onDelete }) => {
    const getSpeciesName = (id) => {
        const speciesItem = species.find((s) => s.species_id === id);
        return speciesItem ? speciesItem.species_name : 'Любой';
    };

    const getGenderName = (id) => {
        const genderItem = genders.find((g) => g.gender_id === id);
        return genderItem ? genderItem.gender_name : 'Любой';
    };

    const getSelectValue = (id) => {
        const selectValueItem = selectValues.find((sv) => sv.select_id === id);
        return selectValueItem ? selectValueItem.select_value : 'Любое';
    };

    return (
        <div className="reference-value-item">
            <div>Вид: {getSpeciesName(referenceValue.species_id)}</div>
            <div>Пол: {getGenderName(referenceValue.gender_id)}</div>
            <div>Возраст: {referenceValue.min_age || 'Любой'} - {referenceValue.max_age || 'Любой'} лет</div>
            <div>
                Значение: {referenceValue.select_value_id ? getSelectValue(referenceValue.select_value_id) : `${referenceValue.min_value || 'Любое'} - ${referenceValue.max_value || 'Любое'}`}
            </div>
            <div className="reference-value-actions">
                <button onClick={() => onEdit(referenceValue)}>Редактировать</button>
                <button onClick={() => onDelete(referenceValue.reference_id)}>Удалить</button>
            </div>
        </div>
    );
};

export default ReferenceValueItem;
