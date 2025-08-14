// frontend/src/pages/Admin.js
import React from 'react';
import { Link } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt, faVial} from "@fortawesome/free-solid-svg-icons";

const Admin = () => {
    return (
        <div className="container">
            <h1>Админка</h1>
            <ul>
                <li>
                    <Link to="/admin/tests">
                        <FontAwesomeIcon icon={faVial} /> Управление анализами
                    </Link>
                </li>
                <li>
                    <Link to="/admin/species">Управление видами питомцев</Link>
                </li>
                <li>
                    <Link to="/admin/genders">Управление видами полов (genders)</Link>
                </li>
                <li>
                    <Link to="/admin/synonyms">Управление синонимами</Link> {/* Новая ссылка */}
                </li>
                <li>
                    <Link to="/admin/files">
                        <FontAwesomeIcon icon={faFileAlt}/> Управление импортированными файлами
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Admin;
