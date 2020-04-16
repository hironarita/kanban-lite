import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { CardModel } from '../models/Card';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle, cardId, columnId, moveCard }) {
    const ref = useRef(null);

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

    const [, drag] = useDrag({
        item: { type: 'card', title, cardId, columnId },
        collect: monitor => monitor.isDragging() ? setIsDragging(true) : setIsDragging(false)
    });

    const [, drop] = useDrop({
        accept: 'card',
        drop: (item) => {
            const oldCard = new CardModel(item.cardId, item.title, item.columnId);
            const newCard = new CardModel(cardId, item.title, columnId);
            moveCard(oldCard, newCard);
        },
        hover: (item) => { if (item.title !== title) { console.log(item) } }
    })

    // allows for the Card component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref} className={'card trello-card ' + (isDragging === true ? 'droppable-card' : '')}>
            {isAdding === false && <span>{isDragging === false && title}</span>}
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