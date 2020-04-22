import React, { useState, useMemo, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { Card } from './Card';
import { CardModel } from '../models/Card';
import { ColumnModel } from '../models/Column';

declare interface IColumnProps {
    readonly columnId: number;
    readonly boardIndex: number;

    /** determines which card is being hovered over */
    readonly highlightedColumnId: number;

    readonly title: string;
    readonly cardCount: number;
    readonly cards: ReadonlyArray<CardModel>;
    readonly changeColumnTitle: (columnId: number, newTitle: string, boardIndex: number) => void;
    readonly setHighlightedColumnId: (id: number) => void;
    readonly setParentCards: (title: string, columnId: number, cardId: number, columnIndex: number) => void;
    readonly moveCard: (cardId: number, newCard: CardModel, oldColumnId: number) => void;
    readonly moveColumn: (columnId: number, newColumn: ColumnModel) => void;
}

declare interface IDraggableColumn {
    readonly type: string;
    readonly title: string;
    readonly columnId: number;
}

export function Column(props: IColumnProps) {
    let textarea = useRef<any>(null);
    const ref = useRef(null);

    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [highlightedCardId, setHighlightedCardId] = useState(0);
    const [columnTitle, setColumnTitle] = useState(props.title);
    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableLeftColumn, setDisplayDroppableLeftColumn] = useState(false);
    const [displayDroppableRightColumn, setDisplayDroppableRightColumn] = useState(false);
    const [columnIndex, setColumnIndex] = useState(props.cardCount);

    useEffect(() => setColumnIndex(props.cardCount), [props.cardCount]);

    const filteredCards = useMemo(() => props.cards
        .filter(x => x.ColumnId === props.columnId)
        .sort((x, y) => x.ColumnIndex > y.ColumnIndex ? 1 : -1), [props.cards, props.columnId]);

    const [, drag] = useDrag({
        item: { type: 'column', title: columnTitle, columnId: props.columnId },
        collect: monitor => {
            if (monitor.isDragging()) setIsDragging(true)
            else {
                setIsDragging(false);
                setDisplayDroppableLeftColumn(false);
                setDisplayDroppableRightColumn(false);
            }
        },
    });

    const [, drop] = useDrop({
        accept: 'column',
        drop: (item: IDraggableColumn) => {
            const boardIndex = displayDroppableLeftColumn === true
                ? props.boardIndex
                : props.boardIndex + 1;
            const newColumn = new ColumnModel(item.columnId, item.title, boardIndex);
            props.moveColumn(item.columnId, newColumn);
        },
        hover: (_item, monitor) => {
            if (monitor.isOver()) props.setHighlightedColumnId(props.columnId);

            const initialOffset = monitor.getInitialClientOffset();
            if (monitor.getClientOffset()!.x < initialOffset!.x) {
                setDisplayDroppableLeftColumn(true);
                setDisplayDroppableRightColumn(false);
            }
            if (monitor.getClientOffset()!.x > initialOffset!.x) {
                setDisplayDroppableRightColumn(true);
                setDisplayDroppableLeftColumn(false);
            }
        }
    })

    const addCard = (title: string) => {
        if (title.length > 0) {
            setCardTitle('');
            props.setParentCards(title, props.columnId, Date.now(), columnIndex);
            setColumnIndex(columnIndex + 1);
        }
        setDisplayCard(false);
    };

    const handleOnChange = (title: string) => {
        setColumnTitle(title);
        props.changeColumnTitle(props.columnId, title, props.boardIndex);
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

    // allows for the Column component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref} className='d-flex'>
            {displayDroppableLeftColumn === true && props.highlightedColumnId === props.columnId && <div className='column droppable-column'></div>}
            <div className={'column ' + (isDragging === true ? 'hide' : '')}>

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
                        moveCard={(oldCardId: number, newCard: CardModel, oldColumnId: number) => props.moveCard(oldCardId, newCard, oldColumnId)} />
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
            {displayDroppableRightColumn === true && props.highlightedColumnId === props.columnId && <div className='column droppable-column'></div>}
        </div>
    )
}