import React, { useState, useMemo } from 'react';
import { Card } from './Card';

export function Column({ columnId, setParentCards, cards, moveCard }) {
    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');

    const addCard = (title) => {
        if (title.length > 0) {
            setCardTitle('');
            setParentCards(title, columnId, Date.now());
        }
        setDisplayCard(false);
    };

    const filteredCards = useMemo(() => cards.filter(x => x.ColumnId === columnId), [cards, columnId]);

    return (
        <div className='column'>
            <h4>Test</h4>
            {filteredCards.map((x, i) =>
                <Card
                    key={i}
                    isAdding={false}
                    title={x.Title}
                    cardId={x.CardId}
                    columnId={columnId}
                    moveCard={(oldCardId, newCard) => moveCard(oldCardId, newCard)} />
            )}
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