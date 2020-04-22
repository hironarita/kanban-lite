import React, { useState, useMemo, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Card } from './Card';
import { CardModel } from '../models/Card';
import { ColumnModel } from '../models/Column';

let columnIndex = 0;

declare interface IColumnProps {
    readonly columnId: number;
    readonly setParentCards: (title: string, columnId: number, cardId: number, columnIndex: number) => void;
    readonly cards: ReadonlyArray<CardModel>;
    readonly moveCard: (cardId: number, newCard: CardModel) => void;
    readonly moveColumn: (columnId: number, newColumn: ColumnModel) => void;
}

export function Column(props: IColumnProps) {
    let textarea = useRef<any>(null);
    const ref = useRef(null);

    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [highlightedCardId, setHighlightedCardId] = useState(0);
    const [columnTitle, setColumnTitle] = useState('');

    const filteredCards = useMemo(() => props.cards
        .filter(x => x.ColumnId === props.columnId)
        .sort((x, y) => x.ColumnIndex > y.ColumnIndex ? 1 : -1), [props.cards, props.columnId]);

    const addCard = (title: string) => {
        if (title.length > 0) {
            setCardTitle('');
            props.setParentCards(title, props.columnId, Date.now(), columnIndex++);
        }
        setDisplayCard(false);
    };

    const handleOnChange = (title: string) => {
        setColumnTitle(title);
    };

    const handleKeyDown = (key: string) => {
        if (key === 'Enter') {
            textarea.current.blur();
        }
    };

    const handleKeyDownForCard = (key: string) => {
        if (key === 'Enter') {
            addCard(cardTitle);
        }
    };

    const handleOnBlurForCard = () => {
        addCard(cardTitle);
    };

    const handleOnChangeForCard = (title: string) => {
        setCardTitle(title);
    };

    return (
        <div ref={ref} className='column'>
            <div className='mb-2'>
                <TextareaAutosize
                    type='text'
                    inputRef={textarea}
                    className='column-title'
                    value={columnTitle}
                    placeholder='Enter list title...'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e.key)} />
            </div>
            {filteredCards.map((x, i) =>
                <Card
                    key={i}
                    title={x.Title}
                    cardId={x.Id}
                    columnId={props.columnId}
                    columnIndex={x.ColumnIndex}
                    highlightedCardId={highlightedCardId}
                    setHighlightedCardId={(id) => setHighlightedCardId(id)}
                    moveCard={(oldCardId, newCard) => props.moveCard(oldCardId, newCard)} />
            )}
            {displayCard === true &&
                <div className='card trello-card'>
                    <TextareaAutosize
                        type='text'
                        autoFocus
                        className='card-input'
                        value={cardTitle}
                        placeholder='Enter a title for this card...'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChangeForCard(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDownForCard(e.key)}
                        onBlur={() => handleOnBlurForCard()} />
                </div>
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