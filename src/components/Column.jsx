import React, { useState, useMemo } from 'react';
import { Card } from './Card';

let columnIndex = 0;

export function Column({ columnId, setParentCards, cards, moveCard }) {
    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [highlightedCardId, setHighlightedCardId] = useState('');

    const addCard = (title) => {
        if (title.length > 0) {
            setCardTitle('');
            setParentCards(title, columnId, Date.now(), columnIndex++);
        }
        setDisplayCard(false);
    };

    const filteredCards = useMemo(() => cards
        .filter(x => x.ColumnId === columnId)
        .sort((x, y) => x.ColumnIndex > y.ColumnIndex ? 1 : -1), [cards, columnId]);

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
                    columnIndex={x.ColumnIndex}

                    // determines which card is being hovered over
                    highlightedCardId={highlightedCardId}

                    setHighlightedCardId={(id) => setHighlightedCardId(id)}
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