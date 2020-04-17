import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { CardModel } from '../models/Card';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle, cardId, columnId, moveCard }) {
    const ref = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableCardAbove, setDisplayDroppableCardAbove] = useState(false);
    const [displayDroppableCardBelow, setDisplayDroppableCardBelow] = useState(false);

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
            setDisplayDroppableCardAbove(false);
            setDisplayDroppableCardBelow(false);
            const newCard = new CardModel(Date.now(), item.title, columnId);
            moveCard(item.cardId, newCard);
        },
        hover: (item, monitor) => {
            if (item.cardId !== cardId) {
                const offset = monitor.getInitialClientOffset().y;
                if (monitor.getClientOffset().y > offset) {
                    return setDisplayDroppableCardBelow(true);
                }
                if (monitor.getClientOffset().y < offset) {
                    return setDisplayDroppableCardAbove(true);
                }

                setDisplayDroppableCardAbove(false);
                setDisplayDroppableCardBelow(false);
            }
        }
    })

    // allows for the Card component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref}>
            {displayDroppableCardAbove === true && <div className='card trello-card droppable-card'></div>}
            <div className={'card trello-card ' + (isDragging === true ? 'hide' : '')}>
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
            {displayDroppableCardBelow === true && <div className='card trello-card droppable-card'></div>}
        </div>
    )
}