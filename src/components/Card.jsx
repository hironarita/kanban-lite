import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle }) {
    const handleKeyDown = (key) => {
        if (key === 'Enter') {
            addCard(newTitle);
        }
    };

    const handleOnBlur = () => {
        console.log('blur')
        addCard(newTitle);
    };

    const handleOnChange = (title) => {
        setParentCardTitle(title);
    };

    return (
        <div className='card trello-card'>
            {isAdding === false && <span>{title}</span>}
            {isAdding === true &&
                <TextareaAutosize
                    type='text'
                    autoFocus
                    className='card-input'
                    value={newTitle}
                    placeholder='Enter a title for this card...'
                    onChange={e => handleOnChange(e.target.value)}
                    onKeyDown={e => handleKeyDown(e.key)}
                    onBlur={() => handleOnBlur()} />
            }
        </div>
    )
}