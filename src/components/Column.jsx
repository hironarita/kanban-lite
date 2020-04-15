import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { useDrop } from 'react-dnd'

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
            const oldCard = {
                cardId: item.cardId,
                title: item.title,
                columnId: item.columnId
            };
            const newCard = {
                cardid: item.cardId,
                title: item.title,
                columnId: columnId
            };
            moveCard(oldCard, newCard);
        }
    })

    const filteredCards = useMemo(() => cards.filter(x => x.columnId === columnId), [cards, columnId]);

    return (
        <div className='column'>
            <h4>Test</h4>
            <div className='card trello-card' ref={drop}></div>
            {filteredCards.map((x, i) => <Card key={i} isAdding={false} title={x.title} cardId={x.cardId} columnId={columnId} />)}
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