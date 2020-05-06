import React, { useState, useMemo, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { Card, IDraggableCard } from './Card';
import { CardModel } from '../models/Card';
import { ColumnModel } from '../models/Column';
import { post } from '../utilities/Axios';

declare interface IColumnProps {
    readonly columnId: number;
    readonly boardIndex: number;

    /** determines which card is being hovered over */
    readonly highlightedColumnId: number;

    readonly title: string;
    readonly cardCount: number;
    readonly dragColumnId: number;
    readonly dragColumnHeight: number;
    readonly dragCardId: number;
    readonly dragCardHeight: number;
    readonly isDragInProgress: boolean;
    readonly cards: ReadonlyArray<CardModel>;
    readonly isLoading: boolean;
    readonly setIsDragInProgress: (x: boolean) => void;
    readonly setDragCardId: (cardId: number) => void;
    readonly setCardHeight: (cardId: number, height: number) => void;
    readonly setDragColumnId: (columnId: number) => void;
    readonly setColumnHeight: (columnId: number, height: number) => void;
    readonly changeColumnTitle: (columnId: number, newTitle: string) => void;
    readonly setHighlightedColumnId: (id: number) => void;
    readonly moveCard: (cardId: number, newCard: CardModel, oldColumnId: number) => void;
    readonly moveColumn: (columnId: number, newColumn: ColumnModel, oldBoardIndex: number) => void;
    readonly getColumnsAndCards: () => Promise<void>;
    readonly setIsLoading: (x: boolean) => void;
}

declare interface IDraggableColumn {
    readonly type: string;
    readonly title: string;
    readonly columnId: number;
    readonly boardIndex: number;
}

export function Column(props: IColumnProps) {
    let textarea = useRef<any>(null);
    const ref = useRef(null);
    const columnRef = useRef<any>(null);

    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [highlightedCardId, setHighlightedCardId] = useState(0);
    const [columnTitle, setColumnTitle] = useState(props.title);
    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableLeftColumn, setDisplayDroppableLeftColumn] = useState(false);
    const [displayDroppableRightColumn, setDisplayDroppableRightColumn] = useState(false);
    const [columnIndex, setColumnIndex] = useState(props.cardCount);
    const [invisibleColumnHeight, setInvisibleColumnHeight] = useState(0);
    const [displayFirstPlaceholderCard, setDisplayFirstPlaceholderCard] = useState(false);

    const columnIdAsString = props.columnId.toString();

    useEffect(() => setColumnIndex(props.cardCount), [props.cardCount]);

    useEffect(() => {
        const height = window.innerHeight - document.getElementById(columnIdAsString)!.getBoundingClientRect().bottom - 40;
        setInvisibleColumnHeight(height);
    }, [displayCard, columnIdAsString]);

    const filteredCards = useMemo(() => props.cards
        .filter(x => x.ColumnId === props.columnId)
        .sort((x, y) => x.ColumnIndex > y.ColumnIndex ? 1 : -1), [props.cards, props.columnId]);


    const [, drag] = useDrag({
        item: { type: 'column', title: columnTitle, columnId: props.columnId, boardIndex: props.boardIndex },
        collect: monitor => {
            if (monitor.isDragging()) {
                if (columnRef.current != null) {
                    const columnHeight = columnRef.current.clientHeight;
                    props.setColumnHeight(props.columnId, columnHeight);
                }
                setIsDragging(true);
                props.setIsDragInProgress(true);
            } else {
                setIsDragging(false);
                setDisplayDroppableLeftColumn(false);
                setDisplayDroppableRightColumn(false);
                setDisplayFirstPlaceholderCard(false);
            }
        },
        begin: () => {
            props.setHighlightedColumnId(props.columnId);
            props.setDragColumnId(props.columnId);
        },
        end: () => props.setIsDragInProgress(false)
    });

    const [, drop] = useDrop({
        accept: ['column', 'card'],
        drop: (item: IDraggableColumn | IDraggableCard) => {
            if (item.type === 'column') {
                const boardIndex = displayDroppableLeftColumn === true
                    ? props.boardIndex
                    : props.boardIndex + 1;
                const newColumn = new ColumnModel(item.columnId, item.title, boardIndex);
                props.moveColumn(item.columnId, newColumn, (item as IDraggableColumn).boardIndex);
            }

            if (item.type === 'card') {
                const newCard = new CardModel((item as IDraggableCard).cardId, item.title, props.columnId, 0);
                props.moveCard((item as IDraggableCard).cardId, newCard, item.columnId);
            }
        },
        collect: monitor => {
            monitor.isOver()
                ? setHighlightedCardId(0)
                : setDisplayFirstPlaceholderCard(false);
        },
        hover: (item, monitor) => {
            if (item.type === 'column') {
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

            if (item.type === 'card') {
                setDisplayFirstPlaceholderCard(true);
            }
        }
    })

    const addCard = async (title: string) => {
        if (title.length > 0) {
            const data = {
                title,
                columnId: props.columnId,
                columnIndex
            };
            props.setIsLoading(true);
            try {
                await post('/cards/create', data);
                await props.getColumnsAndCards();
                setCardTitle('');
                setColumnIndex(columnIndex + 1);
            } finally {
                props.setIsLoading(false);
            }
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

    const handleKeyDownForCard = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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
            {displayDroppableLeftColumn === true && props.highlightedColumnId === props.columnId && isDragging === false &&
                <div style={{ height: props.dragColumnHeight }} className='column droppable-column'></div>
            }
            <div>
                {isDragging === false &&
                    <div>
                        <div id={columnIdAsString} ref={columnRef} className='column'>
                            <div className='mb-2'>
                                <TextareaAutosize
                                    type='text'
                                    inputRef={textarea}
                                    className='column-title'
                                    value={columnTitle}
                                    placeholder='Enter list title...'
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e.key)}
                                    onBlur={() => props.changeColumnTitle(props.columnId, columnTitle)} />
                            </div>
                            {filteredCards.length <= 1 && displayFirstPlaceholderCard === true &&
                                <div style={{ height: props.dragCardHeight }} className='card trello-card placeholder-card'></div>
                            }
                            {filteredCards.map((x, i) =>
                                <Card
                                    key={i}
                                    title={x.Title}
                                    cardId={x.Id}
                                    columnId={props.columnId}
                                    columnIndex={x.ColumnIndex}
                                    highlightedCardId={highlightedCardId}
                                    dragCardHeight={props.dragCardHeight}
                                    dragCardId={props.dragCardId}
                                    setDragCardId={(cardId: number) => props.setDragCardId(cardId)}
                                    setCardHeight={(cardId: number, height: number) => props.setCardHeight(cardId, height)}
                                    setHighlightedCardId={(id) => setHighlightedCardId(id)}
                                    moveCard={(oldCardId: number, newCard: CardModel, oldColumnId: number) => props.moveCard(oldCardId, newCard, oldColumnId)} />
                            )}
                            {displayCard === true &&
                                <div className='card add-card'>
                                    <TextareaAutosize
                                        type='text'
                                        autoFocus
                                        className='card-input'
                                        value={cardTitle}
                                        placeholder='Enter a title for this card...'
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChangeForCard(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDownForCard(e)}
                                        onBlur={() => handleOnBlurForCard()} />
                                </div>
                            }
                            <button
                                type='button'
                                className='btn add-card-button mt-2'
                                onClick={() => { if (displayCard === false) setDisplayCard(true) }}
                                disabled={props.isLoading === true}>
                                + Add a card
                            </button>
                        </div>
                        {props.dragColumnId !== props.columnId && props.isDragInProgress === true &&
                            <div style={{ height: invisibleColumnHeight }} className='invisible-column'></div>
                        }
                    </div>
                }
                {isDragging === true && props.highlightedColumnId === props.dragColumnId &&
                    <div style={{ height: props.dragColumnHeight }} className='placeholder-column'></div>
                }
            </div>
            {displayDroppableRightColumn === true && props.highlightedColumnId === props.columnId && isDragging === false &&
                <div style={{ height: props.dragColumnHeight }} className='column droppable-column'></div>
            }
        </div>
    )
}