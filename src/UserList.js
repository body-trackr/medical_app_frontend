import React, { useState, useEffect } from 'react';
import { getUsers, createUser } from './services/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newUser = await createUser({ name, email });
        setUsers([...users, newUser]);
        setName('');
        setEmail('');
    };

    return (
        <div>
            <h1>Users</h1>
            <form onSubmit={handleSubmit}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <button type="submit">Add User</button>
            </form>
            <ul>
                {users.map(user => (
                    <li key={user.user_id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
