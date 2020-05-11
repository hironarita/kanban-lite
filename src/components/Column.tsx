import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import Swal from 'sweetalert2';
import { Card, IDraggableCard } from './Card';
import { post } from '../utilities/Axios';
import TrashIcon from '../images/trash.svg';

declare interface IColumnProps {
    readonly column: IColumn;

    /** determines which column is being hovered over */
    readonly highlightedColumnId: number;

    /** determines which card is being hovered over */
    readonly highlightedCardId: number;

    readonly dragColumnId: number;
    readonly dragColumnHeight: number;
    readonly dragCardId: number;
    readonly dragCardHeight: number;
    readonly isDragInProgress: boolean;
    readonly cards: ICard[];
    readonly isLoading: boolean;
    readonly setIsDragInProgress: (x: boolean) => void;
    readonly setDragCardId: (cardId: number) => void;
    readonly setCardHeight: (cardId: number, height: number) => void;
    readonly setDragColumnId: (columnId: number) => void;
    readonly setColumnHeight: (columnId: number, height: number) => void;
    readonly changeColumnTitle: (columnId: number, newTitle: string) => void;
    readonly setHighlightedColumnId: (id: number) => void;
    readonly setHighlightedCardId: (id: number) => void;
    readonly moveCard: (newCard: ICard, oldCard: ICard) => void;
    readonly moveColumn: (columnId: number, newColumn: IColumn, oldBoardIndex: number) => void;
    readonly getColumnsAndCards: () => Promise<void>;
    readonly setIsLoading: (x: boolean) => void;
}

export interface IDraggableColumn {
    readonly type: string;
    readonly column: IColumn;
    readonly cards: ICard[];
}

export function Column(props: IColumnProps) {
    let textarea = useRef<any>(null);
    const ref = useRef(null);
    const columnRef = useRef<any>(null);

    const [displayCard, setDisplayCard] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [columnTitle, setColumnTitle] = useState(props.column.title);
    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableLeftColumn, setDisplayDroppableLeftColumn] = useState(false);
    const [displayDroppableRightColumn, setDisplayDroppableRightColumn] = useState(false);
    const [columnIndex, setColumnIndex] = useState(props.cards.length);
    const [invisibleColumnHeight, setInvisibleColumnHeight] = useState(0);
    const [displayFirstPlaceholderCard, setDisplayFirstPlaceholderCard] = useState(false);

    const columnIdAsString = props.column.id.toString();

    useEffect(() => setColumnIndex(props.cards.length), [props.cards]);

    useEffect(() => {
        const el = document.getElementById(columnIdAsString);
        if (el != null) {
            const height = window.innerHeight - el.getBoundingClientRect().bottom - 40;
            setInvisibleColumnHeight(height);
        }
    }, [columnIdAsString, props.cards]);

    const sortedCards = props.cards.sort((x, y) => x.columnIndex > y.columnIndex ? 1 : -1);

    const [, drag, preview] = useDrag({
        item: {
            type: 'column',
            column: props.column,
            cards: sortedCards
        },
        collect: monitor => {
            if (monitor.isDragging()) {
                if (columnRef.current != null) {
                    const columnHeight = columnRef.current.clientHeight;
                    props.setColumnHeight(props.column.id, columnHeight);
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
            props.setHighlightedColumnId(props.column.id);
            props.setDragColumnId(props.column.id);
        },
        end: () => props.setIsDragInProgress(false)
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const [, drop] = useDrop({
        accept: ['column', 'card'],
        drop: (item: IDraggableColumn | IDraggableCard) => {
            if (item.type === 'column') {
                const col = (item as IDraggableColumn).column;
                const boardIndex = displayDroppableLeftColumn === true
                    ? props.column.boardIndex
                    : props.column.boardIndex + 1;
                let newColumn = { ...col };
                newColumn = { ...newColumn, boardIndex };
                props.moveColumn(col.id, newColumn, col.boardIndex);
            }

            if (item.type === 'card' && props.cards.length === 0) {
                const oldCard = (item as IDraggableCard).card;
                let newCard = { ...oldCard }
                newCard = { ...newCard, column_id: props.column.id, columnIndex: 0 };
                props.moveCard(newCard, oldCard);
            }
        },
        collect: monitor => {
            if (monitor.isOver() === false) {
                setDisplayFirstPlaceholderCard(false)
            }
        },
        hover: (item: IDraggableColumn | IDraggableCard, monitor) => {
            if (item.type === 'column') {
                if (monitor.isOver()) props.setHighlightedColumnId(props.column.id);

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

            if (item.type === 'card' && props.cards.length === 0) {
                setDisplayFirstPlaceholderCard(true);
                props.setHighlightedCardId(0);
            }

            if (item.type === 'card' && props.cards.length === 1 && (item as IDraggableCard).card.column_id === props.column.id) {
                props.setHighlightedCardId((item as IDraggableCard).card.id);
            }
        }
    });

    const addCard = async (title: string) => {
        if (title.length > 0) {
            const data = {
                title,
                columnId: props.column.id,
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

    const removeColumn = async () => {
        props.setIsLoading(true);
        Swal.fire({
            title: 'Are you sure you want to delete this list?',
            text: "It will also delete all corresponding cards.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async result => {
            if (result.value) {
                try {
                    await post('/columns/delete/' + props.column.id);
                    await props.getColumnsAndCards();
                    Swal.fire(
                        'Deleted!',
                        'Your list has been deleted.',
                        'success'
                    );
                } finally {
                    props.setIsLoading(false);
                }
            }
        });

    };

    // allows for the Column component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref} className='d-flex'>
            {displayDroppableLeftColumn === true && props.highlightedColumnId === props.column.id && isDragging === false &&
                <div style={{ height: props.dragColumnHeight }} className='column droppable-column'></div>
            }
            <div>
                {isDragging === false &&
                    <div>
                        <div id={columnIdAsString} ref={columnRef} className='column'>
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                                <TextareaAutosize
                                    type='text'
                                    inputRef={textarea}
                                    className='column-title'
                                    value={columnTitle}
                                    placeholder='Enter list title...'
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e.key)}
                                    onBlur={() => props.changeColumnTitle(props.column.id, columnTitle)} />
                                <img
                                    src={TrashIcon}
                                    alt='delete icon'
                                    onClick={() => removeColumn()} />
                            </div>
                            {sortedCards.length <= 1 && displayFirstPlaceholderCard === true &&
                                <div style={{ height: props.dragCardHeight }} className='card trello-card placeholder-card'></div>
                            }
                            {sortedCards.map((x, i) =>
                                <Card
                                    key={i}
                                    card={x}
                                    highlightedCardId={props.highlightedCardId}
                                    dragCardHeight={props.dragCardHeight}
                                    dragCardId={props.dragCardId}
                                    isDragInProgress={props.isDragInProgress}
                                    setIsDragInProgress={(x: boolean) => props.setIsDragInProgress(x)}
                                    setDragCardId={(cardId: number) => props.setDragCardId(cardId)}
                                    setCardHeight={(cardId: number, height: number) => props.setCardHeight(cardId, height)}
                                    setHighlightedCardId={(id) => props.setHighlightedCardId(id)}
                                    moveCard={(newCard: ICard, oldCard: ICard) => props.moveCard(newCard, oldCard)} />
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
                                className='btn add-card-button mt-2 add-logout-btn'
                                onClick={() => { if (displayCard === false) setDisplayCard(true) }}
                                disabled={props.isLoading === true}>
                                + Add a card
                            </button>
                        </div>
                        {props.dragColumnId !== props.column.id && props.isDragInProgress === true &&
                            <div style={{ height: invisibleColumnHeight }} className='invisible-column'></div>
                        }
                    </div>
                }
                {isDragging === true && props.highlightedColumnId === props.dragColumnId &&
                    <div style={{ height: props.dragColumnHeight }} className='placeholder-column'></div>
                }
            </div>
            {displayDroppableRightColumn === true && props.highlightedColumnId === props.column.id && isDragging === false &&
                <div style={{ height: props.dragColumnHeight }} className='column droppable-column'></div>
            }
        </div>
    )
}