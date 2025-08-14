// frontend/src/pages/EditTest.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import EditableParameterRow from '../components/EditableParameterRow';
import ReferenceModal from '../components/ReferenceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './styles/EditTest.css';

const parameterTypes = [
    { value: 'numeric', label: 'Числовой' },
    { value: 'boolean', label: 'Булевое' },
    { value: 'titer', label: 'Титр' },
    { value: 'select_one', label: 'Значение из списка' },
    { value: 'other', label: 'Другое' },
];

const EditTest = () => {
    const { testId } = useParams();
    const [testName, setTestName] = useState('');
    const [parameters, setParameters] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [showReferenceModal, setShowReferenceModal] = useState(false);
    const [currentParameter, setCurrentParameter] = useState(null);
    const [test, setTest] = useState(null);

    useEffect(() => {
        fetchTest();
    }, [testId]);

    const fetchTest = async () => {
        try {
            const response = await api.get(`/tests/${testId}`);
            setTestName(response.data.data.test.test_name);
            setParameters(response.data.data.parameters);
            setTest(response.data.data.test);
        } catch (error) {
            console.error('Error fetching test:', error);
        }
    };

    const handleDeleteParameter = async (parameterId) => {
        try {
            await api.delete(`/test-parameters/${parameterId}`);
            fetchTest();
        } catch (error) {
            console.error('Error deleting parameter:', error);
        }
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
    };

    const handleOpenReferenceModal = (parameter) => {
        setCurrentParameter(parameter);
        setShowReferenceModal(true);
    };

    const handleCloseReferenceModal = () => {
        setShowReferenceModal(false);
        setCurrentParameter(null);
    };

    const handleConfirmTest = async () => {
        try {
            await api.put(`/tests/${test.test_id}`, {status: 'CONFIRMED'});
            fetchTest(); // reload
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <Breadcrumbs testName={testName} />
            <div className="card">
                <div className='container'>
                    {test && test.status === 'WAIT_CONFIRMATION' && (
                        <button onClick={handleConfirmTest}>
                            Подтвердить анализ
                        </button>
                    )}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Название параметра</th>
                            <th>Единица измерения</th>
                            <th>Тип параметра</th>
                            <th>Референсные значения</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parameters.map((parameter, index) => (
                            <EditableParameterRow
                                key={parameter.parameter_id}
                                parameter={parameter}
                                index={index}
                                onUpdate={fetchTest}
                                onDelete={handleDeleteParameter}
                                onOpenReferenceModal={handleOpenReferenceModal}
                            />
                        ))}
                        {isAdding && (
                            <EditableParameterRow
                                parameter={{ parameter_name: '', unit: '', parameter_type: 'numeric', test_id: testId }}
                                isNew={true}
                                onUpdate={fetchTest}
                                onCancelAdd={handleCancelAdd}
                            />
                        )}
                    </tbody>
                </table>
                {!isAdding && (
                    <button className="add-button" onClick={() => setIsAdding(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
            </div>
            {showReferenceModal && (
                <ReferenceModal onClose={handleCloseReferenceModal} parameter={currentParameter} />
            )}
        </div>
    );
};

export default EditTest;
