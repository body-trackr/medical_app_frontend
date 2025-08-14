/**
 * @file src/components/hooks/useUnits.js
 * Хук для подгрузки списка единиц измерения (units) для параметра типа concentration.
 */

import { useState } from 'react';
import api from '../../api';

/**
 * useUnits - хук для ленивой загрузки единиц измерения конкретного параметра.
 * @param {number} parameterId - ID параметра, для которого грузим единицы.
 * @returns {{ data: Array, loading: boolean, error: string | null, fetchData: () => Promise<void>}}
 */
export function useUnits(parameterId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    if (!parameterId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/test-parameters/${parameterId}/units`);
      setData(response.data.data.units);
    } catch (err) {
      setError('Ошибка при загрузке units');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchData };
}
