/**
 * @file src/components/ResultParametersSection.js
 * Отображение списка параметров (ResultParameterRow) с возможностью редактирования.
 */

import React from 'react';
import ResultParameterRow from './ResultParameterRow';

/**
 * @typedef {Object} ParameterItem
 * @property {number} parameter_id
 * @property {string} parameter_name
 * @property {string} parameter_type
 * @property {string | null} value
 * @property {string | null} unit
 * @property {number | null} select_value_id
 */

/**
 * @typedef {Object} ResultParametersSectionProps
 * @property {Array<ParameterItem>} resultValues
 * @property {(index: number, changes: Partial<ParameterItem>) => void} onParameterChange
 */

/**
 * Компонент для отображения списка параметров
 * @param {ResultParametersSectionProps} props
 */
export default function ResultParametersSection({ resultValues, onParameterChange }) {
  return (
    <div className="result-parameters-section">
      {resultValues.map((rv, index) => (
        <ResultParameterRow
          key={rv.parameter_id}
          parameterId={rv.parameter_id}
          parameterName={rv.parameter_name}
          parameterType={rv.parameter_type}
          value={rv.value}
          unit={rv.unit}
          selectValueId={rv.select_value_id}
          onChange={(changes) => onParameterChange(index, changes)}
        />
      ))}
    </div>
  );
}
