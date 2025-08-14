import React from 'react';
import './styles/TestCard.css';

const TestCard = ({ testName, lastTestDate, parameters, onClick, testId }) => {
    const nonReferenceParameters = parameters.filter(param => !param.is_reference);

    return (
        <div className="test-card" onClick={() => onClick(testId)}>
            <h3>{testName}</h3>
            <p>Последняя дата: {lastTestDate}</p>
            {nonReferenceParameters.length > 0 ? (
                <ul>
                    {nonReferenceParameters.map((param, index) => (
                        <li key={index}>{param.name}: {param.value}</li>
                    ))}
                </ul>
            ) : (
                <p className="green-checkmark">&#10003;</p>
            )}
        </div>
    );
};

export default TestCard;
