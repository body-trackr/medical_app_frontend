/**
 * @file frontend/src/components/SkeletonTestCard.js
 */

import React from 'react';
import './styles/TestCard.css';

/**
 * @description Карточка-заглушка для теста в состоянии загрузки
 */
const SkeletonTestCard = ({ testName }) => {
  return (
    <div className='test-card skeleton'>
      <h3 className='skeleton-title'>{testName}</h3>
      <p className='skeleton-line'>Загрузка данных...</p>
    </div>
  );
};

export default SkeletonTestCard;
