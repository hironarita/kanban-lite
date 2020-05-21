import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'
import { Dropdown } from 'react-bootstrap';
import { swal } from '../utilities/Utilities';
import { Card, IDraggableCard } from './Card';
import { post } from '../utilities/Axios';
import ActionsIcon from '../images/actions.svg';
import BackArrow from '../images/backArrow.svg';

declare interface IColumnProps {
    readonly column: IColumn;

    /** determines which column is being hovered over */
    readonly highlightedColumnId: number;

    /** determines which card is being hovered over */
    readonly highlightedCardId: number;

    /** determines which card is being hovered over while NOT dragging */
    readonly hoverCardId: number;

    readonly dragColumnId: number;
    readonly dragColumnHeight: number;
    readonly dragCardId: number;
    readonly dragCardHeight: number;
    readonly isDragInProgress: boolean;
    readonly cards: ICard[];
    readonly isLoading: boolean;
    readonly columnCount: number;
    readonly setHoverCardId: (cardId: number) => void;
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
    const textarea = useRef<any>(null);
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
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
    const [isMoveListMenuOpen, setIsMoveListMenuOpen] = useState(false);
    const [moveIndex, setMoveIndex] = useState(props.column.boardIndex);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);

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
                newColumn = { ...newColumn, boardIndex, isNew: true };
                props.moveColumn(col.id, newColumn, col.boardIndex);
            }

            if (item.type === 'card' && props.cards.length === 0) {
                const oldCard = (item as IDraggableCard).card;
                setTimeout(() => props.setHoverCardId(oldCard.id), 50);
                let newCard = { ...oldCard }
                newCard = { ...newCard, column_id: props.column.id, columnIndex: 0, isNew: true };
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

    const removeColumn = async () => {
        const response = await swal.fire({
            title: 'Are you sure you want to delete this list?',
            text: 'It will also delete all corresponding cards.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });
        if (response.value) {
            props.setIsLoading(true);
            try {
                await post('/columns/delete/' + props.column.id);
                await props.getColumnsAndCards();
                swal.fire(
                    'Deleted!',
                    'Your list has been deleted.',
                    'success'
                );
            } finally {
                props.setIsLoading(false);
            }
        }
    };

    const openMoveListMenu = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        // stops the dropdown from closing
        e.stopPropagation();

        setIsMoveListMenuOpen(true);
    }

    const actionsToggle = React.forwardRef<any, any>(({ children, onClick }, actionsToggleRef) => (
        <img
            src={ActionsIcon}
            alt='actions icon'
            ref={actionsToggleRef}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }} />
    ));

    const moveDropdownItem = () => <span className='dropdown-item' onClick={e => openMoveListMenu(e)}>Move List...</span>;

    const deleteDropdownItem = () => <span className='dropdown-item' onClick={e => removeColumn()}>Delete</span>;

    const positionToggle = React.forwardRef<any, any>(({ children, onClick }, positionToggleRef) => (
        <div
            ref={positionToggleRef}
            className='position-btn'
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}>
                <div>
                    <span>Position</span>
                </div>
                <div>
                    <span>{moveIndex + 1}</span>
                </div>
        </div>
    ));

    const setMoveIndexAndCloseMenu = (index: number) => {
        setMoveIndex(index);
        setIsPositionDropdownOpen(false);
    };

    const moveColumnFromDropdown = () => {
        setIsActionsDropdownOpen(false);
        let newColumn = { ...props.column };
        newColumn = { ...newColumn, boardIndex: moveIndex === 0 ? 0 : moveIndex + 1, isNew: true };
        props.moveColumn(props.column.id, newColumn, props.column.boardIndex);
    };

    const positionDropdownItem = (index: number) =>
        <span className='dropdown-item position-dropdown-item' onClick={() => setMoveIndexAndCloseMenu(index)}>
            {index + 1 + (index === props.column.boardIndex ? ' (current)' : '')}
        </span>;

    const handleOnToggle = (isOpen: boolean) => {
        if (isOpen === false) {
            setIsMoveListMenuOpen(false);
            setMoveIndex(props.column.boardIndex);
        }
        setIsActionsDropdownOpen(!isActionsDropdownOpen);
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColumnTitle(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e.key)}
                                    onBlur={() => props.changeColumnTitle(props.column.id, columnTitle)} />
                                <Dropdown show={isActionsDropdownOpen} onToggle={(isOpen: boolean) => handleOnToggle(isOpen)}>
                                    <Dropdown.Toggle id='actions-dropdown-toggle' as={actionsToggle} />
                                    <Dropdown.Menu bsPrefix='dropdown-menu actions-dropdown-menu'>
                                        {isMoveListMenuOpen === true &&
                                            <div>
                                                <img
                                                    src={BackArrow}
                                                    alt='back'
                                                    className='back-arrow'
                                                    onClick={() => setIsMoveListMenuOpen(false)} />
                                                <Dropdown show={isPositionDropdownOpen} onToggle={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}>
                                                    <Dropdown.Toggle id='position-dropdown-toggle' as={positionToggle} />
                                                    <Dropdown.Menu bsPrefix='dropdown-menu position-dropdown-menu'>
                                                        {new Array(props.columnCount)
                                                            .fill('')
                                                            .map((_x, i) => <Dropdown.Item key={i} as={() => positionDropdownItem(i)} />)
                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                                <button
                                                    className='btn add-card-button mt-3'
                                                    disabled={props.isLoading === true}
                                                    onClick={() => moveColumnFromDropdown()}>
                                                    Move
                                                </button>
                                            </div>
                                        }
                                        {isMoveListMenuOpen === false &&
                                            <div>
                                                <Dropdown.Item as={moveDropdownItem} />
                                                <Dropdown.Item as={deleteDropdownItem} />
                                            </div>
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>
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
                                    hoverCardId={props.hoverCardId}
                                    setHoverCardId={(cardId: number) => props.setHoverCardId(cardId)}
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardTitle(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDownForCard(e)}
                                        onBlur={() => addCard(cardTitle)} />
                                </div>
                            }
                            <button
                                type='button'
                                className='btn add-card-button mt-2 add-logout-btn'
                                onClick={() => { if (displayCard === false) setDisplayCard(true) }}
                                disabled={props.isLoading === true}>
                                + Add <span>{props.cards.length === 0 ? 'a' : 'another'}</span> card
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