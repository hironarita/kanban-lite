import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { CardModel } from '../models/Card';

export function Card({ isAdding, addCard, title, setParentCardTitle, newTitle, cardId, columnId, moveCard, highlightedCardId, setHighlightedCardId, columnIndex }) {
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
        collect: monitor => {
            if (monitor.isDragging()) setIsDragging(true)
            else {
                setIsDragging(false);
                setDisplayDroppableCardAbove(false);
                setDisplayDroppableCardBelow(false);
            }
        },
    });

    const [, drop] = useDrop({
        accept: 'card',
        drop: (item) => {
            const colIndex = displayDroppableCardAbove === true
                ? columnIndex - 1
                : columnIndex + 1;
            const newCard = new CardModel(Date.now(), item.title, columnId, colIndex);
            moveCard(item.cardId, newCard);
        },
        hover: (_item, monitor) => {
            if (monitor.isOver()) setHighlightedCardId(cardId);

            const initialOffset = monitor.getInitialClientOffset();
            if (monitor.getClientOffset().y < initialOffset.y) {
                setDisplayDroppableCardAbove(true);
                setDisplayDroppableCardBelow(false);
            }
            if (monitor.getClientOffset().y > initialOffset.y) {
                setDisplayDroppableCardBelow(true);
                setDisplayDroppableCardAbove(false);
            }
        }
    })

    // allows for the Card component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref}>
            {displayDroppableCardAbove === true && highlightedCardId === cardId && <div className='card trello-card droppable-card'></div>}
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
            {displayDroppableCardBelow === true && highlightedCardId === cardId && <div className='card trello-card droppable-card'></div>}
        </div>
    )
}