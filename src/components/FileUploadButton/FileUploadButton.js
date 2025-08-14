/**
 * @file frontend/src/components/FileUploadButton.js
 * @description Компонент кнопки для загрузки файла с отображением спиннера во время загрузки
 */

import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import api from '../../api';
import { toast } from 'react-toastify';
import './FileUploadButton.css'

/**
 * @typedef {Object} FileUploadButtonProps
 * @property {boolean} disabled - отключена ли кнопка (например, если нет прав)
 * @property {() => void} [onUploadSuccess] - колбэк при успешной загрузке
 * @property {() => void} [onUploadError] - колбэк при ошибке
 */

/**
 * @param {FileUploadButtonProps} props
 * @returns {JSX.Element}
 */
export default function FileUploadButton(props) {
  const { disabled, onUploadSuccess, onUploadError } = props;
  const [isLoading, setIsLoading] = useState(false);

  // Реф на скрытый input
  const fileInputRef = useRef(null);

  /**
   * @description открываем диалог выбора файла
   */
  function handleClick() {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  /**
   * @description обработчик выбора файла
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload-file', formData);
      // Успех загрузки
      toast.success(response.data.data.message);
      onUploadSuccess?.();
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при загрузке файла';
      toast.error(errorMessage);
      onUploadError?.();
    } finally {
      setIsLoading(false);
      // Сброс input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div>
      {/* Сам скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type='file'
        className='upload-button'
        onChange={handleFileChange}
      />

      {/* Кнопка, которая отображается в интерфейсе */}
      <label
        type='button'
        className={`add-button ${isLoading ? 'uploading' : ''}`}
        onClick={handleClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <div className='spinner'></div>
        ) : (
          <FontAwesomeIcon icon={faUpload} />
        )}
      </label>
    </div>
  );
}
