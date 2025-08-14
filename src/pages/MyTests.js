/**
 * @file frontend/src/pages/MyTests.js
 */

import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import TestCard from '../components/TestCard';
import TestDetailsModal from '../components/TestDetailsModal';
import './styles/MyTests.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResultFormContainer from '../components/ResultForm/ResultFormContainer';
import SkeletonTestCard from '../components/SkeletonTestCard';
import FileUploadButton from '../components/FileUploadButton/FileUploadButton';

const MyTests = () => {
  const [showForm, setShowForm] = useState(false);
  const [tests, setTests] = useState([]);
  const [resultsByTest, setResultsByTest] = useState({});
  const [loadingResults, setLoadingResults] = useState({});
  const [selectedTest, setSelectedTest] = useState(null);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchPermissions();
    fetchTests();
  }, []);

  async function fetchPermissions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/me`, { withCredentials: true });
      setPermissions(response.data.data.permissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  }

  /**
   * @description Загружаем список тестов (эндпоинт /user-tests), сортируем по last_created_result_id (desc), а потом подгружаем результаты
   */
  async function fetchTests() {
    try {
      const response = await api.get('/user-tests');
      let fetchedTests = response.data.data.tests || [];

      // Сортируем: вверху - наибольший last_created_result_id
      fetchedTests.sort((a, b) => (b.last_created_result_id || 0) - (a.last_created_result_id || 0));

      setTests(fetchedTests);

      const initialLoadingState = {};
      fetchedTests.forEach(test => {
        initialLoadingState[test.test_id] = true;
      });
      setLoadingResults(initialLoadingState);

      fetchUserResultsByTests(fetchedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  }

  /**
   * @description Для каждого теста подгружаем /user-results/<test_id>
   */
  async function fetchUserResultsByTests(testsList) {
    for (const test of testsList) {
      try {
        const response = await api.get(`/user-results/${test.test_id}`);
        const testResults = response.data.data;
        setResultsByTest(prev => ({
          ...prev,
          [test.test_id]: testResults
        }));
      } catch (err) {
        console.error('Error fetching results for test', test.test_id, err);
        setResultsByTest(prev => ({
          ...prev,
          [test.test_id]: null
        }));
      } finally {
        setLoadingResults(prev => ({
          ...prev,
          [test.test_id]: false
        }));
      }
    }
  }

  function handleResultAdded() {
    setShowForm(false);
    // fetchUserResultsByTests(tests);
    fetchTests()
  }

  function handleCardClick(testId) {
    setSelectedTest(testId);
  }

  function handleCloseDetails() {
    setSelectedTest(null);
  }

  return (
    <div className='container'>
      <h1>Мои анализы</h1>
      <div className='button-container'>
        {/* Кнопка добавить результат */}
        <label className='add-button' onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </label>

        {/* Кнопка загрузки файла - только если есть permission */}
        {permissions.import_files && (
          <FileUploadButton
            disabled={false}
            onUploadSuccess={() => {
              // После успешного импорта сразу перезагружаем список
              fetchTests();
            }}
            onUploadError={() => {
              toast.error('Ошибка при загрузке файла');
            }}
          />
        )}
      </div>

      <ToastContainer />

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <ResultFormContainer
            tests={tests}
            resultId={null}
            testId={null}
            onResultAdded={handleResultAdded}
            onResultUpdated={() => {}}
            onResultDeleted={() => {}}
          />
        </Modal>
      )}

      <div className='test-cards'>
        {tests.length === 0 && <p>Нет анализов</p>}
        {tests.map((test) => {
          const isLoading = loadingResults[test.test_id];
          const testData = resultsByTest[test.test_id];

          if (isLoading) {
            return (
              <SkeletonTestCard
                key={test.test_id}
                testName={test.test_name}
              />
            );
          }

          // Если загрузка завершилась, но нет результатов
          if (!testData || !testData.dates) {
            return (
              <TestCard
                key={test.test_id}
                testId={test.test_id}
                testName={test.test_name}
                lastTestDate={'Нет данных'}
                parameters={[]}
                onClick={handleCardClick}
              />
            );
          }

          // Нормальный случай
          const lastResultIndex = testData.dates.length - 1;
          const lastTestDate = testData.dates[lastResultIndex];
          const lastParameters = testData.parameters.map((param) => {
            const idx = param.values.length - 1;
            return {
              name: param.name,
              value: param.values[idx].value,
              is_reference: param.values[idx].is_reference
            };
          });

          return (
            <TestCard
              key={test.test_id}
              testId={test.test_id}
              testName={test.test_name}
              lastTestDate={lastTestDate}
              parameters={lastParameters}
              onClick={handleCardClick}
            />
          );
        })}
      </div>

      {selectedTest && (
        <Modal onClose={handleCloseDetails}>
          <TestDetailsModal
            testId={selectedTest}
            testName={tests.find(t => t.test_id === selectedTest)?.test_name || ''}
            onClose={handleCloseDetails}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyTests;
