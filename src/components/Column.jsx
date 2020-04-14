import React, { useState } from 'react';
import { Card } from './Card';

export function Column() {
    const [displayCard, setDisplayCard] = useState(false);
    const [cards, setCards] = useState([]);

    const addCard = (title) => {
        setDisplayCard(false);
        setCards(cards.concat([{ title }]));
    };

    return (
        <div className='column'>
            <h4>Test</h4>
            {cards.map(x => <Card isAdding={false} title={x.title} />)}
            {displayCard === true && <Card isAdding={true} addCard={(title) => addCard(title)} />}
            <button
                type='button'
                className='btn btn-success mt-2'
                onClick={() => setDisplayCard(true)}>
                Add Card
            </button>
        </div>
    )
}