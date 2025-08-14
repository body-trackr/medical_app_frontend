import React, {useEffect, useState} from 'react';
import api from '../api';
import './styles/AddResultForm.css';

const AddResultForm = ({ tests, onResultAdded, onResultUpdated, onResultDeleted, resultId, testId }) => {
    const [selectedTestId, setSelectedTestId] = useState('');
    const [resultDate, setResultDate] = useState('');
    const [resultValues, setResultValues] = useState([]);
    const [selectValues, setSelectValues] = useState({});
    const [units, setUnits] = useState({});

    useEffect(() => {
        if (testId) {
            setSelectedTestId(testId)
        }
    }, [])

    useEffect(() => {
        if (selectedTestId) {
            fetchTestParameters(selectedTestId).then(() => {
                if (resultId) {
                    fetchResultData(resultId).then(() => {});
                }
            });
        }
    }, [resultId, selectedTestId]);

    const fetchResultData = async (resultId) => {
        try {
            const response = await api.get(`/results/${resultId}`);
            const result = response.data.data;
            setSelectedTestId(result.test_id);
            setResultDate(result.result_date);
            setResultValues(result.result_values.map(rv => ({
                parameter_id: rv.parameter_id,
                value: rv.value,
                unit: rv.unit,
                parameter_type: rv.parameter_type,
                select_value_id: rv.select_value_id,
            })));
        } catch (error) {
            console.error('Error fetching result data:', error);
        }
    };

    const fetchTestParameters = async (testId) => {
        try {
            const response = await api.get(`/tests/${testId}`);
            const parameters = response.data.data.parameters;

            setResultValues(parameters.map(rv => ({
                parameter_id: rv.parameter_id,
                parameter_name: rv.parameter_name,
                value: null,
                unit: null,
                parameter_type: rv.parameter_type,
                select_value_id: null,
            })));

            await fetchSelectValues(parameters);
            await fetchUnits(parameters);
        } catch (error) {
            console.error('Error fetching test parameters:', error);
        }
    };

    const fetchSelectValues = async (parameters) => {
        const values = {};
        for (let param of parameters) {
            if (param.parameter_type === 'select_one') {
                try {
                    const response = await api.get(`/test-parameters/${param.parameter_id}/select-values`);
                    values[param.parameter_id] = response.data.data.select_values;
                } catch (error) {
                    console.error('Error fetching select values:', error);
                }
            }
        }
        setSelectValues(values);
    };

    const fetchUnits = async (parameters) => {
        const unitData = {};
        for (let param of parameters) {
            if (param.parameter_type === 'concentration') {
                try {
                    const response = await api.get(`/test-parameters/${param.parameter_id}/units`);
                    unitData[param.parameter_id] = response.data.data.units;
                } catch (error) {
                    console.error('Error fetching units:', error);
                }
            }
        }
        setUnits(unitData);
    };

    function _getUpdateValuesOnForm() {
        return resultValues.map((rv) => {
            if (rv.parameter_type === 'concentration') {
                if (!rv.unit) {
                    if (units[rv.parameter_id].length === 1) {
                        return {...rv, unit: units[rv.parameter_id][0].unit_name};
                    } else {
                        return {
                            ...rv,
                            unit: units[rv.parameter_id].find(
                                unit => unit.unit_name === rv.unit)?.unit_name || units[rv.parameter_id][0].unit_name
                        };
                    }
                }
            }
            return rv;
        })
    }

    const handleAddResult = async () => {
        try {
            const updatedResultValues = _getUpdateValuesOnForm()

            const response = await api.post('/results', {
                test_id: selectedTestId,
                result_date: resultDate,
                result_values: updatedResultValues.map(({ parameter_id, value, unit, select_value_id }) => ({
                    parameter_id,
                    value,
                    unit,
                    select_value_id,
                })),
            });
            let result = response.data.data;

            onResultAdded(result);
        } catch (error) {
            console.error('Error adding or updating result:', error);
        }
    };

    const handleUpdateResult = async () => {
        try {
            const updatedResultValues = _getUpdateValuesOnForm()

            const response = await api.put(`/results/${resultId}`, {
                test_id: selectedTestId,
                result_date: resultDate,
                result_values: updatedResultValues.map(({ parameter_id, value, unit, select_value_id }) => ({
                    parameter_id,
                    value,
                    unit,
                    select_value_id,
                })),
            });
            let result = response.data.data;
            result = {
                result_id: result.result_id,
                result_date: result.result_date,
                result_parameter_values: updatedResultValues.reduce((acc, { parameter_id, value, unit }) => { acc[parameter_id] = { value, unit }; return acc; }, {})
            };
            onResultUpdated(result);

        } catch (error) {
            console.error('Error adding or updating result:', error);
        }
    };


    const handleDeleteResult = async () => {
        try {
            await api.delete(`/results/${resultId}`);
            onResultDeleted(resultId);
        } catch (error) {
            console.error('Error deleting result:', error);
        }
    };

    const handleResultValueChange = (index, key, value) => {
        const updatedValues = [...resultValues];
        updatedValues[index][key] = value;
        setResultValues(updatedValues);
    };

    const handleSelectValueChange = (index, value) => {
        const updatedValues = [...resultValues];
        const selectedValue = selectValues[resultValues[index].parameter_id].find(
            (selectValue) => selectValue.select_value === value
        );
        updatedValues[index].value = value;
        updatedValues[index].select_value_id = selectedValue ? selectedValue.select_id : null;
        setResultValues(updatedValues);
    };

    const handleUnitChange = (index, value) => {
        const updatedValues = [...resultValues];
        updatedValues[index].unit = value;
        setResultValues(updatedValues);
    };

    return (
        <div className="form-container">
            <h2>{resultId ? 'Редактировать результат анализа' : 'Добавить новый результат анализа'}</h2>
            {!resultId && (
                <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
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
                onChange={(e) => setResultDate(e.target.value)}
            />
            {resultValues.map((resultValue, index) => (
                <div key={index} className="result-value">
                    <label>{resultValue.parameter_name}</label>
                    {resultValue.parameter_type === 'select_one' ? (
                        <select
                            value={resultValue.value}
                            onChange={(e) =>
                                handleSelectValueChange(index, e.target.value)
                            }
                        >
                            <option value="">Выберите значение</option>
                            {selectValues[resultValue.parameter_id]?.map((selectValue) => (
                                <option key={selectValue.select_id} value={selectValue.select_value}>
                                    {selectValue.select_value}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="input-with-unit">
                            <input
                                type="text"
                                placeholder="Значение"
                                value={resultValue.value}
                                onChange={(e) =>
                                    handleResultValueChange(index, 'value', e.target.value)
                                }
                            />
                            {resultValue.parameter_type === 'concentration' && units[resultValue.parameter_id] && (
                                units[resultValue.parameter_id].length > 1 ? (
                                    <select
                                        value={resultValue.unit}
                                        onChange={(e) =>
                                            handleUnitChange(index, e.target.value)
                                        }
                                    >
                                        {units[resultValue.parameter_id].map((unit) => (
                                            <option key={unit.unit_id} value={unit.unit_name}>
                                                {unit.unit_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select value={units[resultValue.parameter_id][0].unit_name} readOnly>
                                        <option value={units[resultValue.parameter_id][0].unit_name}>
                                            {units[resultValue.parameter_id][0].unit_name}
                                        </option>
                                    </select>
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}
            {resultId ? (
                <button onClick={handleUpdateResult}>Обновить результат</button>
            ) : (
                <button onClick={handleAddResult}>Сохранить результат</button>
            )}
            {resultId && (
                    <button className="delete-button" onClick={handleDeleteResult}>Удалить результат</button>
            )}
        </div>
    );
};

export default AddResultForm;
