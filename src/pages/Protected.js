import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Protected = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/protected', { withCredentials: true });
                if (response.data.result) {
                    setData(response.data.data);
                    setError('');
                } else {
                    setError(response.data.error);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to fetch protected data');
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Protected Data</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};

export default Protected;
