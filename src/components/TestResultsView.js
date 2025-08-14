// frontend/src/components/TestResultsView.js

import React, {useEffect, useState} from 'react';
import api from '../api';
import './styles/TestResultsView.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faArrowLeft, faFile} from '@fortawesome/free-solid-svg-icons';

import Modal from './Modal';
import AddResultForm from './AddResultForm';

const TestResultsView = ({testId}) => {
    const [testResults, setTestResults] = useState(null);
    const [editingResultId, setEditingResultId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTestResults(page);
    }, [testId]);

    const fetchTestResults = async (pageNumber) => {
        try {
            const response = await api.post('/test-results', {test_id: testId, page: pageNumber});
            const data = response.data.data;

            if (pageNumber > 1 && testResults) {
                // Добавляем новые результаты к началу
                setTestResults(prev => ({
                    ...prev,
                    results: [...data.results, ...prev.results],
                    total_pages: data.total_pages,
                }));
            } else {
                setTestResults(data);
                setTotalPages(data.total_pages);
            }
        } catch (error) {
            console.error('Error fetching test results:', error);
        }
    };

    const handleEditClick = (resultId) => {
        setEditingResultId(resultId);
        setShowForm(true);
    };

    const handleResultAdded = () => {
        setShowForm(false);
        fetchTestResults(page);
    };

    const handleResultDeleted = (result_id) => {
        setShowForm(false);
        setTestResults(prev => {
            const updatedResults = prev.results.filter(result =>
                result.result_id !== result_id
            );

            return {
                ...prev,
                results: updatedResults,
            };
        });
    };

    const handleResultUpdated = (updatedResult) => {
        setTestResults(prev => {
            const updatedResults = prev.results.map(result =>
                result.result_id === updatedResult.result_id ? updatedResult : result
            );
            return {
                ...prev,
                results: updatedResults,
            };
        });
        setShowForm(false);
    };

    if (!testResults) {
        return <div>Loading...</div>;
    }

    return (
        <div className='test-results-container'>
            <div className='pagination-controls'>
                {page < totalPages && (
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        onClick={() => {
                            const newPage = page + 1;
                            setPage(newPage);
                            fetchTestResults(newPage);
                        }}
                        className='pagination-arrow'
                    />
                )}
            </div>
            <table>
                <thead>
                <tr>
                    <th>Параметр</th>
                    {testResults.results.map((result) => {
                        const isImported = result.import_file_id !== null;
                        return (
                            <th key={result.result_id}>
                                {result.result_date}
                                {isImported ? (
                                    <FontAwesomeIcon
                                        icon={faFile}
                                        title='Результат импортирован, редактирование недоступно'
                                        style={{marginLeft: '8px', cursor: 'default', color: '#aaa'}}
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        title='Редактировать'
                                        onClick={() => handleEditClick(result.result_id)}
                                        style={{marginLeft: '8px', cursor: 'pointer'}}
                                    />
                                )}
                            </th>
                        );
                    })}
                </tr>
                </thead>
                <tbody>
                {testResults.parameters.map((param) => (
                    <tr key={param.parameter_id}>
                        <td>{param.parameter_name}</td>
                        {testResults.results.map((result) => {
                            const cellData = result.result_parameter_values[param.parameter_id];
                            let displayValue = '';
                            let cellClass = '';
                            if (cellData) {
                                const {value, is_reference} = cellData;

                                if (value === null) {
                                    // Булевоподобный случай без значения
                                    if (is_reference === true) {
                                        displayValue = '✔';
                                    } else if (is_reference === false) {
                                        displayValue = '✘';
                                    } else {
                                        displayValue = '';
                                    }
                                } else {
                                    // Обычный случай с числовым или текстовым значением
                                    displayValue = value;
                                }

                                if (is_reference) {
                                    cellClass = 'reference-value';
                                }
                            }

                            return (
                                <td key={result.result_id} className={cellClass}>
                                    {displayValue}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
            {showForm && (
                <Modal onClose={() => setShowForm(false)}>
                    <AddResultForm
                        testId={testId}
                        resultId={editingResultId}
                        onResultAdded={handleResultAdded}
                        onResultUpdated={handleResultUpdated}
                        onResultDeleted={handleResultDeleted}
                    />
                </Modal>
            )}
        </div>
    );
};

export default TestResultsView;
