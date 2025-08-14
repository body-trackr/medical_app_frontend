import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import {Link} from "react-router-dom";
// import './styles/Files.css';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchFiles(currentPage);
    }, [currentPage]);

    const fetchFiles = async (page) => {
        try {
            const response = await api.get(`/files?page=${page}`);
            setFiles(response.data.data.files);
            setTotalPages(response.data.data.pages);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await api.delete(`/files/${fileId}`);
            fetchFiles(currentPage);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleViewDetails = (file) => {
        setSelectedFile(file);
    };

    const closeModal = () => {
        setSelectedFile(null);
    };

    return (
        <div className="container">
            <h1>Управление импортированными файлами</h1>
            <table className="files-table">
                <thead>
                    <tr>
                        <th>Дата импорта</th>
                        <th>Лаборатория</th>
                        <th>Статус</th>
                        <th>Количество результатов</th>
                        <th>Пользователь</th> {/* Добавили новую колонку */}
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id}>
                            <td>{file.date}</td>
                            <td>{file.laboratory}</td>
                            <td>{file.status}</td>
                            <td>{file.results.length}</td>
                            <td>{file.user}</td> {/* Выводим id пользователя */}
                            <td>
                                <Link to={`/admin/files/${file.id}/details`} className="btn btn-primary">
                                    Детали
                                </Link>
                                <button onClick={() => handleDeleteFile(file.id)}>Удалить</button>
                            </td>
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

            {selectedFile && (
                <Modal onClose={closeModal}>
                    <h2>Детали файла</h2>
                    <p>Лаборатория: {selectedFile.laboratory}</p>
                    <p>Дата импорта: {selectedFile.date}</p>
                    <p>Статус: {selectedFile.status}</p>
                    <p>Результаты: {selectedFile.results.length}</p>
                </Modal>
            )}
        </div>
    );
};

export default Files;
