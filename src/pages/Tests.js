// frontend/src/pages/Tests.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Breadcrumbs from '../components/Breadcrumbs';
import Modal from '../components/Modal';  // Импортируем модуль попапа
import SynonymsModal from '../components/SynonymsModal'; // Импортируем новый компонент для синонимов
import './styles/Tests.css';

const Tests = () => {
    const [tests, setTests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [testName, setTestName] = useState('');
    const [editTestId, setEditTestId] = useState(null);
    const [active, setActive] = useState(false);  // Новое состояние
    const [showSynonymsModal, setShowSynonymsModal] = useState(false); // Состояние для управления модальным окном синонимов
    const [selectedTestId, setSelectedTestId] = useState(null); // Состояние для выбранного теста

    useEffect(() => {
        fetchTests(currentPage);
    }, [currentPage]);

    const fetchTests = async (page) => {
        try {
            // 1) Забираем все тесты
            const response = await api.get(`/tests?page=${page}`);
            let fetchedTests = response.data.data.tests;

            // 2) Сортируем (сначала WAIT_CONFIRMATION, потом CONFIRMED)
            fetchedTests.sort((a, b) => {
                if (a.status === 'WAIT_CONFIRMATION' && b.status === 'CONFIRMED') return -1;
                if (a.status === 'CONFIRMED' && b.status === 'WAIT_CONFIRMATION') return 1;
                return 0;
            });
            // setTests(response.data.data.tests);
            setTests(fetchedTests);
            setTotalPages(response.data.data.pages);
        } catch (error) {
            console.error('Error fetching tests:', error);
        }
    };

    const handleActivateChange = async (test) => {
        if (test.status !== 'CONFIRMED') {
            // Нельзя
            return; // или показываем popup
        }
        try {
            await api.put(`/tests/${test.test_id}`, {
                active: !test.active,
            });
            fetchTests(currentPage);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateOrUpdateTest = async () => {
        try {
            const data = { test_name: testName, active: active };  // Отправляем active
            if (editTestId) {
                await api.put(`/tests/${editTestId}`, data);
            } else {
                await api.post('/tests', data);
            }
            setTestName('');
            setActive(false);  // Сбрасываем значение active
            setEditTestId(null);
            fetchTests(currentPage);
        } catch (error) {
            console.error('Error saving test:', error);
        }
    };

    const handleDeleteTest = async (testId) => {
        try {
            await api.delete(`/tests/${testId}`);
            fetchTests(currentPage);
        } catch (error) {
            console.error('Error deleting test:', error);
        }
    };

    const handleEditTest = (test) => {
        setTestName(test.test_name);
        setActive(test.active);  // Устанавливаем значение active
        setEditTestId(test.test_id);
    };

    const openSynonymsModal = (testId) => {
        setSelectedTestId(testId);
        setShowSynonymsModal(true);  // Открываем модальное окно для синонимов
    };

    const closeSynonymsModal = () => {
        setSelectedTestId(null);
        setShowSynonymsModal(false);  // Закрываем модальное окно
    };

    return (
        <div className="container">
            <Breadcrumbs />
            <h1>Управление анализами</h1>
            <div className="card">
                <input
                    type="text"
                    placeholder="Название анализа"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                />
                <label>
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                    />
                    Активен
                </label>
                <button onClick={handleCreateOrUpdateTest}>
                    {editTestId ? 'Обновить анализ' : 'Создать анализ'}
                </button>
            </div>
            <div className="card">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название анализа</th>
                        <th>Статус</th>
                        <th>Активен</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tests.map((t) => {
                        const isWait = t.status === 'WAIT_CONFIRMATION';
                        const rowClass = isWait ? 'highlight-wait' : '';
                        return (
                            <tr key={t.test_id} className={rowClass}>
                                <td>{t.test_id}</td>
                                <td><Link to={`/admin/tests/${t.test_id}`}>{t.test_name}</Link></td>
                                <td>{t.status}</td>
                                <td>
                                    <input
                                        type='checkbox'
                                        checked={t.active}
                                        disabled={t.status !== 'CONFIRMED'}
                                        onChange={() => handleActivateChange(t)}
                                        title={t.status !== 'CONFIRMED' ? 'Нельзя активировать не подтверждённый анализ' : ''}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleEditTest(t)}>Редактировать</button>
                                    <button onClick={() => handleDeleteTest(t.test_id)}>Удалить</button>
                                    <button onClick={() => openSynonymsModal(t.test_id)}>Синонимы</button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
                <div className="pagination">
                    {Array.from({length: totalPages}, (_, index) => (
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

            {/* Модальное окно для синонимов */}
            {showSynonymsModal && (
                <Modal onClose={closeSynonymsModal}>
                    <SynonymsModal testId={selectedTestId} />
                </Modal>
            )}
        </div>
    );
};

export default Tests;
