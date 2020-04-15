import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag } from 'react-dnd';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle, cardId, columnId }) {
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

    const [{ opacity }, dragRef] = useDrag({
        item: { type: 'card', title, cardId, columnId },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
    });

    return (
        <div ref={dragRef} className={'card trello-card ' + opacity}>
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