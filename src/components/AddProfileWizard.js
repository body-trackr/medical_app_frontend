import React, {useEffect, useState} from 'react';
import axios from 'axios';

const AddProfileWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [isHuman, setIsHuman] = useState(true);
    const [species, setSpecies] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        is_human: true,
        species_id: null,
        gender: '',
        birthdate: ''
    });

    useEffect(() => {
        fetchSpecies();
    }, []);

    const fetchSpecies = async () => {
        try {
            const response = await axios.get('http://localhost:5000/species', { withCredentials: true });
            setSpecies(response.data.data.species);
        } catch (error) {
            console.error('Error fetching species:', error);
        }
    };

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post('http://localhost:5000/profiles', profileData, { withCredentials: true });
            onComplete();
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    };

    return (
        <div>
            {step === 1 && (
                <div>
                    <h2>Выберите тип профиля</h2>
                    <button onClick={() => { setIsHuman(true); handleNext(); }}>Человек</button>
                    <button onClick={() => { setIsHuman(false); handleNext(); }}>Питомец</button>
                </div>
            )}
            {step === 2 && !isHuman && (
                <div>
                    <h2>Выберите вид</h2>
                    <select name="species_id" value={profileData.species_id} onChange={handleInputChange}>
                        <option value="">Выберите вид</option>
                        {species.map((spec) => (
                            <option key={spec.species_id} value={spec.species_id}>
                                {spec.species_name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleBack}>Назад</button>
                    <button onClick={handleNext}>Далее</button>
                </div>
            )}
            {step === 3 && (
                <div>
                    <h2>Введите данные профиля</h2>
                    <input
                        type="text"
                        name="name"
                        placeholder="Имя"
                        value={profileData.name}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="gender"
                        placeholder="Пол"
                        value={profileData.gender}
                        onChange={handleInputChange}
                    />
                    <input
                        type="date"
                        name="birthdate"
                        placeholder="Дата рождения"
                        value={profileData.birthdate}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleBack}>Назад</button>
                    <button onClick={handleSubmit}>Создать профиль</button>
                </div>
            )}
        </div>
    );
};

export default AddProfileWizard;
