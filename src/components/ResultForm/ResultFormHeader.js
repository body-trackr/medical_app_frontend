/**
 * @file src/components/ResultFormHeader.js
 * Заголовок формы для создания/редактирования результата: выбор теста, ввод даты, кнопки "Сохранить" / "Удалить"
 */

import React from 'react';

/**
 * @typedef {Object} ResultFormHeaderProps
 * @property {boolean} isEditMode - true, если редактируем существующий результат
 * @property {string} selectedTestId
 * @property {Array} tests - список тестов (ID, name, active)
 * @property {string} resultDate
 * @property {(value: string) => void} onChangeTestId
 * @property {(value: string) => void} onChangeDate
 * @property {() => void} onSave
 * @property {() => void} [onDelete]
 */

/**
 * Компонент заголовка формы
 * @param {ResultFormHeaderProps} props
 */
export default function ResultFormHeader(props) {
  const {
    isEditMode,
    selectedTestId,
    tests,
    resultDate,
    onChangeTestId,
    onChangeDate,
    onSave,
    onDelete
  } = props;

  return (
    <div className="result-form-header">
      <h2>{isEditMode ? 'Редактировать результат анализа' : 'Добавить новый результат анализа'}</h2>

      {!isEditMode && (
        <select
          value={selectedTestId}
          onChange={(e) => onChangeTestId(e.target.value)}
        >
          <option value="">Выберите анализ</option>
          {tests.filter(test => test.active === true).map((test) => (
            <option key={test.test_id} value={test.test_id}>
              {test.test_name}
            </option>
          ))}
        </select>
      )}

      <input
        type="date"
        value={resultDate}
        onChange={(e) => onChangeDate(e.target.value)}
      />

      <button onClick={onSave}>
        {isEditMode ? 'Обновить результат' : 'Сохранить результат'}
      </button>

      {isEditMode && onDelete && (
        <button className="delete-button" onClick={onDelete}>Удалить результат</button>
      )}
    </div>
  );
}
