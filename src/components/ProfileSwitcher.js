import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ProfileSwitcher = ({ onProfileChange }) => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await api.get('/profiles');
            setProfiles(response.data.data.profiles);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleProfileChange = (event) => {
        const profileId = event.target.value;
        if (profileId === 'add') {
            navigate('/add-profile');
        } else {
            setSelectedProfile(profileId);
            onProfileChange(profileId);
        }
    };

    return (
        <div>
            <select value={selectedProfile} onChange={handleProfileChange}>
                <option value="">Выберите профиль</option>
                {profiles.map((profile) => (
                    <option key={profile.profile_id} value={profile.profile_id}>
                        {profile.name}
                    </option>
                ))}
                <option value="add">Добавить новый профиль</option>
            </select>
        </div>
    );
};

export default ProfileSwitcher;
