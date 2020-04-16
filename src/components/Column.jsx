import React, { useState, useMemo } from 'react';
import { useDrop } from 'react-dnd'
import { Card } from './Card';
import { CardModel } from '../models/Card';

let cardId = 0;

export function Column({ columnId, setParentCards, cards, moveCard }) {
    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');

    const addCard = (title) => {
        if (title.length > 0) {
            setCardTitle('');
            setParentCards(title, columnId, cardId++);
        }
        setDisplayCard(false);
    };

    const [, drop] = useDrop({
        accept: 'card',
        drop: (item) => {
            const oldCard = new CardModel(item.cardId, item.title, item.columnId);
            const newCard = new CardModel(item.cardId, item.title, columnId);
            moveCard(oldCard, newCard);
        }
    })

    const filteredCards = useMemo(() => cards.filter(x => x.ColumnId === columnId), [cards, columnId]);

    return (
        <div className='column'>
            <h4>Test</h4>
            <div className='card trello-card' ref={drop}></div>
            {filteredCards.map((x, i) => <Card key={i} isAdding={false} title={x.Title} cardId={x.CardId} columnId={columnId} />)}
            {displayCard === true &&
                <Card
                    isAdding={true}
                    addCard={(title) => addCard(title)}
                    setParentCardTitle={(title) => setCardTitle(title)}
                    newTitle={cardTitle} />
            }
            <button
                type='button'
                className='btn btn-success mt-2'
                onClick={() => { if (displayCard === false) setDisplayCard(true) }}>
                Add Card
            </button>
        </div>
    )
}