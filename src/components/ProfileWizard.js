// frontend/src/components/ProfileWizard.js

import React, { useEffect, useState } from 'react';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import './styles/ProfileWizard.css';


const CONSENT_VERSION = '1.0';  // Текущая версия согласия
const CONSENT_NAME = 'privacy_policy';  // Техническое название соглашения

const ProfileWizard = ({ onComplete }) => {
    const [genderId, setGenderId] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [genders, setGenders] = useState([]);
    const [consentGiven, setConsentGiven] = useState(false);
    const [consentText, setConsentText] = useState('');
    const [needsProfile, setNeedsProfile] = useState(false);
    const [needsConsent, setNeedsConsent] = useState(false);

    useEffect(() => {
        fetchGenders();
        checkUserProfile();
        fetchConsentText();
    }, []);

    const fetchGenders = async () => {
        try {
            const response = await api.get('/genders');
            setGenders(response.data.data.genders);
        } catch (error) {
            console.error('Error fetching genders:', error);
        }
    };

    const checkUserProfile = async () => {
        try {
            const response = await api.get('/profiles/me');
            const profile = response.data.data.profile;
            setNeedsProfile(response.data.data.needs_profile);
            setNeedsConsent(response.data.data.needs_consent);

            if (profile) {
                setGenderId(profile.gender_id || '');
                setBirthdate(profile.birthdate || '');
            }
        } catch (error) {
            console.error('Error checking user profile:', error);
        }
    };

    const fetchConsentText = async () => {
        try {
            const response = await fetch(`/legal/${CONSENT_NAME}/${CONSENT_VERSION}.md`);
            const text = await response.text();
            setConsentText(text);
        } catch (error) {
            console.error('Error fetching consent text:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {};
            if (needsProfile) {
                data.gender_id = genderId;
                data.birthdate = birthdate;
            }
            if (needsConsent) {
                data.consent_given = consentGiven;
                data.consent_version = CONSENT_VERSION;
            }

            await api.post('/profiles', data);
            onComplete();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="wizard-container">
            <h2>Заполните данные вашего профиля</h2>
            <form onSubmit={handleSubmit}>
                {needsProfile && (
                    <>
                        <div>
                            <label>Пол:</label>
                            <select value={genderId} onChange={(e) => setGenderId(e.target.value)}>
                                <option value="">Выберите пол</option>
                                {genders.map((gender) => (
                                    <option key={gender.gender_id} value={gender.gender_id}>
                                        {gender.gender_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Дата рождения:</label>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                            />
                        </div>
                    </>
                )}
                {needsConsent && (
                    <div className="consent-section">
                        <h3>Согласие на обработку персональных данных</h3>
                        <div className="consent-text">
                            <ReactMarkdown>{consentText}</ReactMarkdown>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                />
                                Я принимаю условия соглашения
                            </label>
                        </div>
                    </div>
                )}
                <button type="submit" disabled={(needsProfile && (!genderId || !birthdate)) || (needsConsent && !consentGiven)}>
                    Сохранить
                </button>
            </form>
        </div>
    );
};

export default ProfileWizard;
