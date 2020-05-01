import React, { useState } from 'react';

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');

declare interface ILoginSignupProps {
    readonly logIn: () => void;
}
export function LoginSignup(props: ILoginSignupProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingIn, setIsLogginIn] = useState(false);

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
            props.logIn();
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
            props.logIn();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center vw-100 login-signup-container'>
            <form className='login-signup-form'>
                <h1 className='logged-out-logo text-center mb-5'>Kanban Lite</h1>
                <div className='form-group'>
                    <input
                        type='text'
                        className='form-control'
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        id='username'
                        placeholder='Enter username'
                        disabled={isLoading === true} />
                </div>
                <div className='form-group'>                 
                    <input
                        type='password'
                        className='form-control'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        id='password'
                        placeholder='Password'
                        disabled={isLoading === true} />
                </div>
                {isLoggingIn === false &&
                    <div className='form-group'>                     
                        <input
                            type='password'
                            className='form-control'
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            id='confirmPassword'
                            placeholder='Confirm password'
                            disabled={isLoading === true} />
                    </div>
                }
                <button
                    type='button'
                    className='btn login-btn w-100'
                    disabled={isLoading}
                    onClick={() => isLoggingIn === true ? login() : register()}>
                    {isLoggingIn === true ? 'Log In' : 'Sign Up'}
                </button>
                <div className='text-center mt-5'>
                    {isLoggingIn === true
                        ? <span className='login-question-text'>Don't have an account? <span className='login-link' onClick={() => setIsLogginIn(false)}>Sign up here</span></span>
                        : <span className='login-question-text'>Already have an account? <span className='login-link' onClick={() => setIsLogginIn(true)}>Log in here</span></span>
                    }                  
                </div>
            </form>
        </div>
    )
}