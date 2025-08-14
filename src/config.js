const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const CLIENT_CAPTCHA_KEY = process.env.REACT_APP_CLIENT_CAPTCHA_KEY;
const FAVICON = process.env.REACT_APP_FAVICON || 'logo192.png';
const TELEGRAM_CHANNEL_LINK = process.env.REACT_APP_TELEGRAM_CHANNEL_LINK || 'https://t.me/body_trackr';
const APP_NAME = process.env.REACT_APP_APP_NAME || 'Labrius';



export { API_BASE_URL, CLIENT_CAPTCHA_KEY, FAVICON, APP_NAME, TELEGRAM_CHANNEL_LINK };
