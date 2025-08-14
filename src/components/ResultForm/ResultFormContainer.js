/**
 * @file src/components/ResultFormContainer.js
 * Единый контейнер, рефакторинг AddResultForm: теперь декомпозирован.
 */

import React, { useEffect, useState } from 'react';
// import api from '../api';
import ResultFormHeader from './ResultFormHeader';
import ResultParametersSection from './ResultParametersSection';
import api from "../../api";

/**
 * @typedef {Object} ResultFormContainerProps
 * @property {Array} tests - список тестов
 * @property {number | null} resultId - если есть, значит режим редактирования
 * @property {number | null} testId - если есть, значит создаём по конкретному тесту
 * @property {() => void} onResultAdded - callback после успешного POST
 * @property {(updatedResult: any) => void} onResultUpdated - callback после успешного PUT
 * @property {(deletedId: number) => void} onResultDeleted - callback после успешного DELETE
 */

/**
 * Единый компонент для создания/редактирования результата анализа.
 * (Замена громоздкого AddResultForm)
 * @param {ResultFormContainerProps} props
 */
export default function ResultFormContainer(props) {
  const {
    tests,
    resultId,
    testId,
    onResultAdded,
    onResultUpdated,
    onResultDeleted
  } = props;

  const [activeTests, setActiveTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [resultValues, setResultValues] = useState([]);

  const isEditMode = !!resultId;

  // Если передали testId — сразу ставим
  useEffect(() => {
    if (testId) {
      setSelectedTestId(String(testId));
    }
  }, [testId]);

  useEffect(() => {
    if (!isEditMode) {
      fetchActiveTests();
    }
  }, [isEditMode]);

  /**
   * Загружаем список активных тестов
   * @returns {Promise<void>}
   */
  async function fetchActiveTests() {
    try {
      const response = await api.get('/active-tests');
      const testsFromApi = response.data.data.tests;
      setActiveTests(testsFromApi);
    } catch (error) {
      console.error('Error fetching active tests:', error);
    }
  }

  // При смене selectedTestId подгружаем параметры (только в режиме создания)
  useEffect(() => {
    if (!isEditMode && selectedTestId) {
      fetchTestParameters(Number(selectedTestId));
    }
  }, [isEditMode, selectedTestId]);

  // При resultId (редактирование) — грузим данные результата
  useEffect(() => {
    if (isEditMode) {
      fetchResultData(Number(resultId));
    }
  }, [isEditMode, resultId]);

  /**
   * Подгрузить данные о параметрах теста
   * @param {number} testIdNum
   */
  async function fetchTestParameters(testIdNum) {
    try {
      const response = await api.get(`/tests/${testIdNum}`);
      const parameters = response.data.data.parameters;
      const mapped = parameters.map((p) => ({
        parameter_id: p.parameter_id,
        parameter_name: p.parameter_name,
        parameter_type: p.parameter_type,
        value: null,
        unit: null,
        select_value_id: null
      }));
      setResultValues(mapped);
    } catch (error) {
      console.error('Error fetching test parameters:', error);
    }
  }

  /**
   * Подгрузить данные результата
   * @param {number} rId
   */
  async function fetchResultData(rId) {
    try {
      const response = await api.get(`/results/${rId}`);
      const result = response.data.data;
      setSelectedTestId(String(result.test_id));
      setResultDate(result.result_date);
      const mapped = result.result_values.map((rv) => ({
        parameter_id: rv.parameter_id,
        parameter_name: '', // подтянем ниже
        parameter_type: rv.parameter_type,
        value: rv.value,
        unit: rv.unit,
        select_value_id: rv.select_value_id
      }));

      // Чтобы подгрузить названия параметров, придётся запросить
      // /tests/:test_id. Или, если b-> avoid double request -> do it
      // simpler approach (2 requests):
      setResultValues(mapped);

      // Загружаем параметры для названий
      await fetchTestParameters(result.test_id);

      // Merge
      setResultValues((old) =>
        old.map((item) => {
          const found = mapped.find((m) => m.parameter_id === item.parameter_id);
          if (found) {
            return { ...item, ...found };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error fetching result data:', error);
    }
  }

  /**
   * Обработчик изменения полей формы (test, date)
   */
  function handleChangeTestId(val) {
    setSelectedTestId(val);
    setResultValues([]); // reset
  }

  function handleChangeDate(val) {
    setResultDate(val);
  }

  /**
   * Обработчик изменения одного параметра
   * @param {number} index
   * @param {Partial<{value: string, unit: string, selectValueId: number}>} changes
   */
  function handleParameterChange(index, changes) {
    setResultValues((prev) => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], ...changes };
      return newArr;
    });
  }

  /**
   * Сформировать payload для отправки
   * @returns {any}
   */
  function buildPayload() {
    return resultValues.map(({ parameter_id, value, unit, select_value_id }) => ({
      parameter_id,
      value,
      unit,
      select_value_id
    }));
  }

  /**
   * Создать результат (POST /results)
   */
  async function handleAddResult() {
    try {
      const payload = buildPayload();
      const response = await api.post('/results', {
        test_id: Number(selectedTestId),
        result_date: resultDate,
        result_values: payload
      });
      onResultAdded?.(response.data.data);
    } catch (error) {
      console.error('Error adding result:', error);
    }
  }

  /**
   * Обновить результат (PUT /results/:id)
   */
  async function handleUpdateResult() {
    if (!resultId) return;
    try {
      const payload = buildPayload();
      const response = await api.put(`/results/${resultId}`, {
        test_id: Number(selectedTestId),
        result_date: resultDate,
        result_values: payload
      });
      onResultUpdated?.(response.data.data);
    } catch (error) {
      console.error('Error updating result:', error);
    }
  }

  /**
   * Удалить результат (DELETE /results/:id)
   */
  async function handleDeleteResult() {
    if (!resultId) return;
    try {
      await api.delete(`/results/${resultId}`);
      onResultDeleted?.(Number(resultId));
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  }

  return (
    <div className="form-container">
      <ResultFormHeader
        isEditMode={isEditMode}
        selectedTestId={selectedTestId}
        tests={activeTests}
        resultDate={resultDate}
        onChangeTestId={handleChangeTestId}
        onChangeDate={handleChangeDate}
        onSave={isEditMode ? handleUpdateResult : handleAddResult}
        onDelete={isEditMode ? handleDeleteResult : undefined}
      />

      {/* Секция параметров */}
      <ResultParametersSection
        resultValues={resultValues}
        onParameterChange={handleParameterChange}
      />
    </div>
  );
}
