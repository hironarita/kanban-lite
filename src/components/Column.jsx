import React, { useState, useMemo } from 'react';
import { Card } from './Card';

export function Column({ columnId, setParentCards, cards, moveCard }) {
    let cardId = 0;

    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');

    const addCard = (title) => {
        if (title.length > 0) {
            setCardTitle('');
            setParentCards(title, columnId, cardId++);
        }
        setDisplayCard(false);
    };

    const filteredCards = useMemo(() => cards
        .sort((x, y) => x.CardId > y.CardId ? 1 : -1)
        .filter(x => x.ColumnId === columnId), [cards, columnId]);

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
                    moveCard={(oldCard, newCard) => moveCard(oldCard, newCard)} />
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