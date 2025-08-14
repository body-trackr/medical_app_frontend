// frontend/src/pages/MyFiles.js

import React, { useEffect, useState } from 'react';
import api from '../api';
import './styles/MyFiles.css';

const MyFiles = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchImportedFiles();
    }, []);

    const fetchImportedFiles = async () => {
        try {
            const response = await api.get('/imported-files');
            setFiles(response.data.data.files);
        } catch (error) {
            console.error('Error fetching imported files:', error);
        }
    };

    return (
        <div className="container">
            <h1>Мои файлы</h1>
            {files.length > 0 ? (
                <table className="files-table">
                    <thead>
                        <tr>
                            <th>Лаборатория</th>
                            <th>Дата</th>
                            <th>Номер заказа</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td>{file.laboratory}</td>
                                <td>{file.date}</td>
                                <td>{file.order_number}</td>
                                <td>{file.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Нет загруженных файлов</p>
            )}
        </div>
    );
};

export default MyFiles;
