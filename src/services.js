import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Убедитесь, что это соответствует вашему URL
});

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (user) => {
    const response = await api.post('/users', user);
    return response.data;
};

// Similar functions can be created for tests, parameters, results, etc.
