import React, { useState } from 'react';
import { Card } from './Card';

export function Column() {
    const [displayCard, setDisplayCard] = useState(false);
    const [cards, setCards] = useState([]);
    const [cardTitle, setCardTitle] = useState('');

    const addCard = (title) => {
        if (title.length > 0) {
            setCardTitle('');
            setCards(cards.concat([{ title }]));
        }
        setDisplayCard(false);
    };

    return (
        <div className='column'>
            <h4>Test</h4>
            {cards.map((x, i) => <Card key={i} isAdding={false} title={x.title} />)}
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