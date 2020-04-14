import React, { useState } from 'react';
import { Card } from './Card';

export function Column() {
    const [displayCard, setDisplayCard] = useState(false);

    return (
        <div className='column'>
            <h4>Test</h4>
            {displayCard === true && <Card />}
            <button
                type='button'
                className='btn btn-success mt-3'
                onClick={() => setDisplayCard(true)}>
                Add Card
            </button>
        </div>
    )
}