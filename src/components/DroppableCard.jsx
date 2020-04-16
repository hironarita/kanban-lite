import React from 'react';
import { useDrop } from 'react-dnd'
import { CardModel } from '../models/Card';

export function DroppableCard({ moveCard, columnId, cardId }) {
    const [, drop] = useDrop({
        accept: 'card',
        drop: (item) => {
            const oldCard = new CardModel(item.cardId, item.title, item.columnId);
            const newCard = new CardModel(cardId, item.title, columnId);
            moveCard(oldCard, newCard);
        }
    })

    return (
        <div className='card trello-card droppable-card' ref={drop}></div>
    )
}