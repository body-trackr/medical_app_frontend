/**
 * @file src/components/hooks/useSelectValues.js
 * Хук для подгрузки select-values для параметров типа select_one.
 */

import { useState } from 'react';
import api from '../../api';

/**
 * useSelectValues - хук для ленивой загрузки select-values конкретного параметра.
 * @param {number} parameterId - ID параметра, для которого грузим варианты.
 * @returns {{ data: Array, loading: boolean, error: string | null, fetchData: () => Promise<void>}}
 */
export function useSelectValues(parameterId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    if (!parameterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/test-parameters/${parameterId}/select-values`);
      setData(response.data.data.select_values);
    } catch (err) {
      setError('Ошибка при загрузке select-values');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchData };
}
