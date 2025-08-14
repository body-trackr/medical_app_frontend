import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const FileDetails = () => {
    const { fileId } = useParams();
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFileValues();
    }, [fileId]);

    const fetchFileValues = async () => {
        try {
            const response = await api.get(`/files/${fileId}/values`);
            setValues(response.data.data.values);
        } catch (error) {
            console.error('Error fetching file values:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessResult = async (valueId) => {
        try {
            const response = await api.post(`/imported-results/${valueId}/process`);
            // Обновляем статус после успешного запроса
            setValues(values.map(value => value.id === valueId ? { ...value, status: 'CONFIRMED' } : value));
        } catch (error) {
            console.error('Error processing result:', error);
            setValues(values.map(value => value.id === valueId ? { ...value, status: 'MANUAL_REVIEW' } : value));
        }
    };

    return (
        <div className="container">
            <h1>Детали файла</h1>
            <button onClick={() => navigate(-1)}>Назад</button>
            {loading ? (
                <p>Загрузка...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Название анализа</th>
                            <th>Группа</th>
                            <th>Значение</th>
                            <th>Единицы</th>
                            <th>Референсные значения</th>
                            <th>Комментарий</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {values.map((value) => (
                            <tr key={value.id}>
                                <td>{value.name}</td>
                                <td>{value.group_name}</td>
                                <td>{value.value}</td>
                                <td>{value.units}</td>
                                <td>{value.reference_range}</td>
                                <td>{value.comment}</td>
                                <td style={{ color: value.status === 'CONFIRMED' ? 'green' : value.status === 'MANUAL_REVIEW' ? 'orange' : 'black' }}>
                                    {value.status}
                                </td>
                                <td>
                                    {value.status === 'PENDING' && (
                                        <button onClick={() => handleProcessResult(value.id)}>Process result</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FileDetails;
