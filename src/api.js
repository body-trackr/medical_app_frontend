import axios from 'axios';
import { API_BASE_URL } from './config';

// Создаем инстанс axios
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
    refreshSubscribers.map((callback) => callback(token));
};

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        const originalRequest = config;

        if (response && response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Если обновление уже в процессе, добавляем запрос в очередь
                return new Promise((resolve) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axios(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                axios
                    .post(`${API_BASE_URL}/token/refresh`, {'refresh_token': localStorage.getItem('refresh_token')}, { withCredentials: true })
                    .then(({ data }) => {
                        const newToken = data.data.refresh_token;
                        localStorage.setItem('refresh_token', newToken);
                        onRefreshed(newToken);
                        refreshSubscribers = [];
                        resolve(axios(originalRequest));
                    })
                    .catch((err) => {
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
