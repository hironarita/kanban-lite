import React, { useState } from 'react';

export function LoginSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
            <button type='button' className='btn btn-primary'>Submit</button>
        </form>
    )
}