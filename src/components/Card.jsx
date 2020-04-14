import React, { useState } from 'react';

export function Card() {
    const [title, setTitle] = useState('');

    return (
        <div className='card trello-card'>
            <input
                type='text'
                className='card-input'
                value={title}
                placeholder='Enter a title for this card...'
                onChange={e => setTitle(e.target.value)} />
        </div>
    )
}