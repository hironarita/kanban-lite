import React, { useState } from 'react';
import axios from 'axios';

export function LoginSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const doFetch = (url: string, method = 'GET') => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Cache', 'no-cache');
        const params = {
            method, headers,
            credentials: 'include' // The cookie must be sent!
        } as any;
        return fetch(url, params);
    }

    const register = async () => {
        const data = {
            username,
            password
        };
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/login', data)
            await axios.get('http://localhost:5000/isLoggedIn', { withCredentials: true })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form>
            <div className='form-group'>
                <label htmlFor='username'>Username</label>
                <input
                    type='text'
                    className='form-control'
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    id='username'
                    placeholder='Enter username' />
            </div>
            <div className='form-group'>
                <label htmlFor='password'>Password</label>
                <input
                    type='password'
                    className='form-control'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    id='password'
                    placeholder='Password' />
            </div>
            <button
                type='button'
                className='btn btn-primary'
                disabled={isLoading}
                onClick={() => register()}>Submit</button>
        </form>
    )
}