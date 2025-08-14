// frontend/src/pages/Synonyms.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import Breadcrumbs from '../components/Breadcrumbs';
// import './styles/Synonyms.css';

const Synonyms = () => {
    const [synonyms, setSynonyms] = useState([]);
    const [tests, setTests] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [testId, setTestId] = useState('');
    const [parameterId, setParameterId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSynonyms();
        fetchTests();
    }, [currentPage, testId, parameterId]);

    const fetchSynonyms = async () => {
        try {
            const response = await api.get('/synonyms', {
                params: {
                    page: currentPage,
                    test_id: testId,
                    parameter_id: parameterId,
                },
            });
            setSynonyms(response.data.data.synonyms);
            setTotalPages(response.data.data.pages);
        } catch (error) {
            console.error('Error fetching synonyms:', error);
        }
    };

    const fetchTests = async () => {
        try {
            const response = await api.get('/tests');
            setTests(response.data.data.tests);
        } catch (error) {
            console.error('Error fetching tests:', error);
        }
    };

    const fetchParameters = async (testId) => {
        try {
            const response = await api.get(`/test-parameters/${testId}`);
            setParameters(response.data.data.parameters);
        } catch (error) {
            console.error('Error fetching parameters:', error);
        }
    };

    const handleTestChange = (e) => {
        setTestId(e.target.value);
        if (e.target.value) {
            fetchParameters(e.target.value);
        } else {
            setParameters([]);
            setParameterId('');
        }
    };

    return (
        <div className="container">
            <Breadcrumbs />
            <h1>Управление синонимами</h1>
            <div className="filters">
                <select value={testId} onChange={handleTestChange}>
                    <option value="">Все тесты</option>
                    {tests.map((test) => (
                        <option key={test.test_id} value={test.test_id}>
                            {test.test_name}
                        </option>
                    ))}
                </select>

                <select value={parameterId} onChange={(e) => setParameterId(e.target.value)} disabled={!testId}>
                    <option value="">Все параметры</option>
                    {parameters.map((param) => (
                        <option key={param.parameter_id} value={param.parameter_id}>
                            {param.parameter_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Синоним</th>
                            <th>Тест</th>
                            <th>Параметр</th>
                            <th>Основной</th>
                            <th>Подтвержденный</th>
                        </tr>
                    </thead>
                    <tbody>
                        {synonyms.map((synonym) => (
                            <tr key={synonym.synonym_id}>
                                <td>{synonym.synonym_id}</td>
                                <td>{synonym.synonym_name}</td>
                                <td>{synonym.test ? synonym.test.test_name : '-'}</td>
                                <td>{synonym.parameter ? synonym.parameter.parameter_name : '-'}</td>
                                <td>{synonym.is_primary ? 'Да' : 'Нет'}</td>
                                <td>{synonym.confirmed ? 'Да' : 'Нет'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={index + 1 === currentPage ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Synonyms;
