import React, { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Path } from '../utilities/Enums';

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');

export function LoginSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isLoggingIn = useRouteMatch().path === Path.Login;

    const login = async () => {
        setIsLoading(true);
        try {      
            await fetch('http://localhost:3000/login', {
                method: 'POST',
                credentials: 'include',
                headers: headers,
                body: JSON.stringify({
                    username,
                    password
                })
            });
        } finally {
            setIsLoading(false);
        }
    };

    const register = async () => {
        setIsLoading(true);
        try {      
            await fetch('http://localhost:3000/register', {
                method: 'POST',
                credentials: 'include',
                headers: headers,
                body: JSON.stringify({
                    username,
                    password
                })
            });
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
                onClick={() => isLoggingIn === true ? login() : register()}>
                {isLoggingIn === true ? 'Login' : 'Signup'}
            </button>
        </form>
    )
}