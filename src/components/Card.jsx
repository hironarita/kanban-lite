import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag } from 'react-dnd';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle, cardId, columnId, setFilterCardId, resetFilterCardId }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleKeyDown = (key) => {
        if (key === 'Enter') {
            addCard(newTitle);
        }
    };

    const handleOnBlur = () => {
        addCard(newTitle);
    };

    const handleOnChange = (title) => {
        setParentCardTitle(title);
    };

    const [, dragRef] = useDrag({
        item: { type: 'card', title, cardId, columnId },
        collect: monitor => monitor.isDragging() ? setIsDragging(true) : setIsDragging(false)
    });

    return (
        <div ref={dragRef} className={'card trello-card ' + (isDragging == true ? 'hide' : '')}>
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