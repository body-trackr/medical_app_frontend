/**
 * @file src/components/ResultParameterRow.js
 */

import React, { useEffect, useState, useRef } from 'react';
import {useSelectValues} from "../hooks/useSelectValues";
import {useUnits} from "../hooks/useUnits";
// import { useSelectValues } from './hooks/useSelectValues';
// import { useUnits } from './hooks/useUnits';

/**
 * @typedef {Object} ResultParameterRowProps
 * @property {number} parameterId
 * @property {string} parameterName
 * @property {string} parameterType
 * @property {string | null} value
 * @property {string | null} unit
 * @property {number | null} selectValueId
 * @property {(changes: Partial<{}>) => void} onChange
 */

/**
 * Компонент для редактирования одного параметра
 * @param {ResultParameterRowProps} props
 * @returns {JSX.Element}
 */
export default function ResultParameterRow(props) {
  const {
    parameterId,
    parameterName,
    parameterType,
    value,
    unit,
    selectValueId,
    onChange
  } = props;

  const [open, setOpen] = useState(true);

  // Вводим локальные флаги, чтобы не загружать данные каждый раз
  const [unitsLoaded, setUnitsLoaded] = useState(false);
  const [selectValuesLoaded, setSelectValuesLoaded] = useState(false);

  const {
    data: selectValues,
    loading: svLoading,
    error: svError,
    fetchData: fetchSelectVals,
  } = useSelectValues(parameterId);

  const {
    data: units,
    loading: unitsLoading,
    error: unitsError,
    fetchData: fetchUnitsData,
  } = useUnits(parameterId);

  // При открытии раскрывающегося блока:
  // Логика:
  // - Если parameterType==='select_one' и selectValues ещё не загружены, то fetchSelectVals()
  // - Если parameterType==='concentration' и units ещё не загружены, то fetchUnitsData()
  useEffect(() => {
    if (!open) return;

    if (parameterType === 'select_one' && !selectValuesLoaded) {
      fetchSelectVals().then(() => setSelectValuesLoaded(true));
    }

    if (parameterType === 'concentration' && !unitsLoaded) {
      fetchUnitsData().then(() => setUnitsLoaded(true));
    }
  }, [
    open,
    parameterType,
    selectValuesLoaded,
    unitsLoaded,
    fetchSelectVals,
    fetchUnitsData
  ]);

  /**
   * Обработчик изменения значения для numeric/concentration
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleValueChange(e) {
    onChange({ value: e.target.value });
  }

  /**
   * Обработчик изменения единицы (если concentration)
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  function handleUnitChange(e) {
    onChange({ unit: e.target.value });
  }

  /**
   * Обработчик выбора select_value (if select_one).
   * Ищем нужный selectValueId?
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  function handleSelectValueChange(e) {
    const newVal = e.target.value;
    const found = selectValues.find((sv) => sv.select_value === newVal);
    onChange({
      value: newVal,
      // selectValueId: found ? found.select_id : null
      select_value_id: found ? found.select_id : null
    });
  }

  return (
    <div className="result-parameter-row">
      <div className="rp-header" onClick={() => setOpen((prev) => !prev)}>
        <span>{parameterName}</span>
        <span>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="rp-body">
          {parameterType === 'select_one' && (
            <>
              {svLoading ? (
                <p>Загрузка вариантов...</p>
              ) : (
                <select value={value || ''} onChange={handleSelectValueChange}>
                  <option value="">Выберите</option>
                  {selectValues.map((sv) => (
                    <option key={sv.select_id} value={sv.select_value}>
                      {sv.select_value}
                    </option>
                  ))}
                </select>
              )}
              {svError && <p className="error">{svError}</p>}
            </>
          )}

          {parameterType === 'concentration' && (
            <div className="rp-body-inline">
              <input
                type="text"
                value={value || ''}
                onChange={handleValueChange}
                placeholder="Введите значение"
              />
              {unitsLoading ? (
                <p>Загрузка единиц...</p>
              ) : (
                <select value={unit || ''} onChange={handleUnitChange}>
                  {units.map((u) => (
                    <option key={u.unit_id} value={u.unit_name}>
                      {u.unit_name}
                    </option>
                  ))}
                </select>
              )}
              {unitsError && <p className="error">{unitsError}</p>}
            </div>
          )}

          {parameterType === 'numeric' && (
            <input
              type="text"
              value={value || ''}
              onChange={handleValueChange}
              placeholder="Введите значение"
            />
          )}

          {/* Другие типы (boolean, titer, other) аналогично */}
          {parameterType === 'boolean' && (
            <select value={value || ''} onChange={(e) => onChange({ value: e.target.value })}>
              <option value="">---</option>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          )}

          {parameterType === 'titer' && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange({ value: e.target.value })}
              placeholder="Titer..."
            />
          )}

          {parameterType === 'other' && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange({ value: e.target.value })}
              placeholder="Введите значение..."
            />
          )}
        </div>
      )}
    </div>
  );
}
