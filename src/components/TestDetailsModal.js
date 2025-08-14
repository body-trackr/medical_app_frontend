import React from 'react';
import TestResultsView from './TestResultsView';
import './styles/TestDetailsModal.css';

const TestDetailsModal = ({ testId, testName, onClose }) => {
    return (
        <div>
            <span className="close" onClick={onClose}>&times;</span>
            <h2>{testName}</h2>
            <TestResultsView testId={testId} />
            <button onClick={onClose}>Закрыть</button>
        </div>
    );
};

export default TestDetailsModal;
