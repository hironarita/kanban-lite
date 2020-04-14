import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export function Card({ isAdding, addCard, title }) {
    const [newTitle, setNewTitle] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && newTitle.length > 0) {
            addCard(newTitle);
        }
    };

    const handleOnBlur = () => {
        if (newTitle.length > 0) {
            addCard(newTitle);
        }
    };

    return (
        <div className='card trello-card'>
            {isAdding === false && <span>{title}</span>}
            {isAdding === true &&
                <TextareaAutosize
                    type='text'
                    className='card-input'
                    value={newTitle}
                    placeholder='Enter a title for this card...'
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => handleKeyDown(e)}
                    onBlur={() => handleOnBlur()} />
            }
        </div>
    )
}