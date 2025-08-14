// frontend/src/components/FilterPanel.js
import React from 'react';
import './styles/FilterPanel.css';

const FilterPanel = ({ tests, selectedTests, setSelectedTests, searchTerm, setSearchTerm }) => {
    const handleCheckboxChange = (testId) => {
        if (selectedTests.includes(testId)) {
            setSelectedTests(selectedTests.filter((id) => id !== testId));
        } else {
            setSelectedTests([...selectedTests, testId]);
        }
    };

    return (
        <div className="filter-panel">
            <h2>Фильтры</h2>
            <input
                type="text"
                placeholder="Поиск"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="checkbox-list">
                {tests.map((test) => (
                    <label key={test.test_id}>
                        <input
                            type="checkbox"
                            checked={selectedTests.includes(test.test_id)}
                            onChange={() => handleCheckboxChange(test.test_id)}
                        />
                        {test.test_name}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
