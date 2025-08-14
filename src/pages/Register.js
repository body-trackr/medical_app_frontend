import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './styles/Register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { APP_NAME, CLIENT_CAPTCHA_KEY, TELEGRAM_CHANNEL_LINK } from '../config';
import {faEdit} from "@fortawesome/free-solid-svg-icons";

const Register = ({ onAuthenticated }) => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [phoneNumber, setPhoneNumber] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [error, setError] = useState('');
    const [sentPhoneNumber, setSentPhoneNumber] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isMaxAttemptsReached, setIsMaxAttemptsReached] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const smsCodeRef = useRef(null);
    const phoneNumberRef = useRef(null);
    const captchaRef = useRef(null);
    const widgetIdRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            navigate('/my-tests');
        }
    }, [navigate]);

    useEffect(() => {
        let timer;
        if (isResendDisabled) {
            timer = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isResendDisabled]);

    useEffect(() => {
        window.onloadFunction = () => {
            if (window.smartCaptcha) {
                const container = document.getElementById('captcha');
                widgetIdRef.current = window.smartCaptcha.render(container, {
                    sitekey: CLIENT_CAPTCHA_KEY,
                    hl: navigator.language || 'ru',
                    callback: handleCaptchaCallback,
                    invisible: true
                });
            }
        };

        function handleScriptLoadingError() {
            console.error('Failed to load SmartCaptcha script');
        }

        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onloadFunction';
        scriptElement.onerror = handleScriptLoadingError;
        document.body.appendChild(scriptElement);

        return () => {
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    const handleCaptchaCallback = async () => {
        const phoneNumber = window.localStorage.getItem('phone_number').replace(/\D/g, '');
        if (phoneNumber.length === 10) {
            let result = await handleSendCode(
                phoneNumber,
                window.smartCaptcha.getResponse(widgetIdRef.current),
            );
            window.smartCaptcha.destroy(widgetIdRef.current);

            const container = document.getElementById('captcha');
            widgetIdRef.current = window.smartCaptcha.render(container, {
                sitekey: CLIENT_CAPTCHA_KEY,
                hl: navigator.language || 'ru',
                callback: handleCaptchaCallback,
                invisible: true
            });
        } else {
            setError('Invalid phone number');
        }
    };

    const executeCaptchaTest = () => {
        window.smartCaptcha.execute(widgetIdRef.current);
    };

    const savePhoneNumerLocalStorage = () => {
        window.localStorage.setItem('phone_number', phoneNumberRef.current.value);
    }

    const handleSendCode = async (phoneNumber, captchaToken) => {
        try {
            const response = await api.post('/register', {
                phone_number: `+7${phoneNumber}`,
                captcha_token: captchaToken
            });
            if (response.data.result) {
                setIsCodeSent(true);
                setError('');
                setSentPhoneNumber(response.data.data.phone_number);
                setIsResendDisabled(true);
                setResendTimer(response.data.data.seconds_to_wait); // Установить таймер из ответа
                setIsMaxAttemptsReached(false); // Сбросить статус попыток

                // Установить фокус на поле ввода SMS кода с небольшой задержкой
                setTimeout(() => {
                    if (smsCodeRef.current) {
                        smsCodeRef.current.focus();
                    }
                }, 100);
                return true;
            } else {
                setError(response.data.error || 'Failed to send verification code');
                if (response.data.data && response.data.data.seconds_to_wait) {
                    setResendTimer(response.data.data.seconds_to_wait);
                    setIsResendDisabled(true);
                }
            }
        } catch (error) {
            setError('Failed to send verification code');
            console.error(error)
        }
    };

    const handleResendCode = () => {
        executeCaptchaTest();
    };

    const handleVerifyCode = async () => {
        try {
            const response = await api.post('/verify', {
                phone_number: sentPhoneNumber,
                sms_code: smsCode,
            });
            if (response.data.result) {
                localStorage.setItem('refresh_token', response.data.data.refresh_token);
                localStorage.removeItem('phone_number');
                onAuthenticated();
                navigate('/my-tests');
                window.smartCaptcha.destroy(widgetIdRef.current);
            } else {
                setError(response.data.error || 'Invalid verification code');
                if (response.data.data && response.data.data.max_attempts_reached) {
                    setIsMaxAttemptsReached(true);
                }
            }
        } catch (error) {
            setError('Invalid verification code');
        }
    };

    const handlePhoneNumberChange = (e) => {
        let input = e.target.value.replace(/\D/g, '');

        // Если номер начинается с "8", то убираем первую цифру
        if (input.startsWith('8') && input.length === 11) {
            input = input.slice(1);
        }

        // Если номер начинается с "7", то убираем первую цифру
        if (input.startsWith('7') && input.length === 11) {
            input = input.slice(1);
        }

        // Если номер начинается с "+7", то убираем "+7"
        if (input.startsWith('+7') && input.length === 12) {
            input = input.slice(2);
        }

        input = input.slice(0, 10); // Ограничиваем длину номера до 10 цифр

        let formattedPhoneNumber = '';
        if (input.length > 0) {
            formattedPhoneNumber = input.slice(0, 3);
        }
        if (input.length >= 4) {
            formattedPhoneNumber += '-' + input.slice(3, 6);
        }
        if (input.length >= 7) {
            formattedPhoneNumber += '-' + input.slice(6, 8);
        }
        if (input.length >= 9) {
            formattedPhoneNumber += '-' + input.slice(8, 10);
        }
        setPhoneNumber(formattedPhoneNumber);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (isCodeSent) {
                handleVerifyCode();
            } else {
                savePhoneNumerLocalStorage();
                executeCaptchaTest();
            }
        }
    };

    const handleEditPhoneNumber = () => {
        setIsCodeSent(false);
        setPhoneNumber('');
        setSentPhoneNumber('');
    };

    return (
        <div className="register-container">
            {/* Краткое описание приложения */}
            <div className="app-description">
                <p>Это приложение позволяет удобно хранить и управлять результатами медицинских анализов. Все данные в одном месте, доступные в любой момент.</p>
            </div>

            <h2 className="title">Регистрация / Вход</h2>
            {error && <p className="error">{error}</p>}
            <div id="captcha" ref={captchaRef}></div>
            {!isCodeSent ? (
                <>
                    <div className="input-group">
                        <span>+7</span>
                        <input
                            ref={phoneNumberRef}
                            className="input-primary"
                            type="tel"
                            placeholder="XXX-XXX-XX-XX"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            style={{fontSize: '1.2em'}}
                            pattern="\d*"
                            inputMode="numeric"
                        />
                    </div>
                </>
            ) : (
                <div className="confirmation-message">
                    <p>SMS код подтверждения отправлен на номер <strong>{sentPhoneNumber}</strong></p>
                    <FontAwesomeIcon icon={faEdit} onClick={handleEditPhoneNumber} className="edit-icon"/>
                </div>
            )}
            {isCodeSent && (
                <>
                    <input
                        ref={smsCodeRef}
                        className="input-primary"
                        type="text"
                        placeholder="XXXX"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isMaxAttemptsReached}
                        style={{fontSize: '1.2em'}}
                        inputMode="numeric"
                        pattern="\d*"
                    />
                    <button
                        className="button-primary"
                        onClick={handleVerifyCode}
                        disabled={isMaxAttemptsReached}
                    >
                        Подтвердить
                    </button>
                    <button
                        className="button-secondary"
                        onClick={handleResendCode}
                        disabled={isResendDisabled}
                    >
                        Переотправить код {isResendDisabled && `(${resendTimer})`}
                    </button>
                </>
            )}
            {!isCodeSent && (
                <button className="button-primary" onClick={() => {
                    savePhoneNumerLocalStorage();
                    executeCaptchaTest();
                }}>
                    Получить код по СМС
                </button>
            )}
            {/* Футер */}
            <footer className="footer">
                {TELEGRAM_CHANNEL_LINK && (
                    <p>
                        Следите за нами в <a href={TELEGRAM_CHANNEL_LINK} target="_blank" rel="noopener noreferrer">Telegram</a>
                    </p>
                )}
                <p>&copy; {currentYear} {APP_NAME}. Все права защищены.</p>
            </footer>
        </div>
    );
};

export default Register;
