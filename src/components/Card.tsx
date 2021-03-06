import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useHistory } from 'react-router-dom';
import { isMobile, isTablet } from 'react-device-detect';
import { Path } from '../utilities/Enums';

declare interface ICardProps {
    readonly card: ICard;
    readonly dragCardHeight: number;
    readonly dragCardId: number;
    readonly isDragInProgress: boolean;

    /** determines which card is being hovered over while NOT dragging */
    readonly hoverCardId: number;

    /** determines which card is being hovered over while dragging */
    readonly highlightedCardId: number;

    readonly setHoverCardId: (cardId: number) => void;
    readonly setDragCardId: (cardId: number) => void;
    readonly setCardHeight: (cardId: number, height: number) => void;
    readonly moveCard: (newCard: ICard, oldCard: ICard) => void;
    readonly setHighlightedCardId: (cardId: number) => void;
    readonly setIsDragInProgress: (x: boolean) => void;
}

export interface IDraggableCard {
    readonly type: string;
    readonly card: ICard;
}

export function Card(props: ICardProps) {
    const ref = useRef(null);
    const cardRef = useRef<any>(null);
    const history = useHistory();

    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableCardAbove, setDisplayDroppableCardAbove] = useState(false);
    const [displayDroppableCardBelow, setDisplayDroppableCardBelow] = useState(false);

    const onDesktop = !isMobile && !isTablet;

    const [, drag, preview] = useDrag({
        item: { type: 'card', card: props.card },
        collect: monitor => {
            if (monitor.isDragging()) {
                if (cardRef.current != null) {
                    const cardHeight = cardRef.current.clientHeight + 2;
                    props.setCardHeight(props.card.id, cardHeight);
                }
                setIsDragging(true);
            } else {
                setIsDragging(false);
                setDisplayDroppableCardAbove(false);
                setDisplayDroppableCardBelow(false);
            }
        },
        begin: () => {
            props.setIsDragInProgress(true);
            props.setDragCardId(props.card.id);
            props.setHighlightedCardId(props.card.id);
        },
        end: () => props.setIsDragInProgress(false)
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const [, drop] = useDrop({
        accept: 'card',
        drop: (item: IDraggableCard) => {
            setTimeout(() => props.setHoverCardId(item.card.id), 50);
            const oldCard = item.card;
            const columnIndex = displayDroppableCardAbove === true
                ? props.card.columnIndex
                : props.card.columnIndex + 1;
            let newCard = { ...oldCard };
            newCard = { ...oldCard, column_id: props.card.column_id, columnIndex, isNew: true };
            props.moveCard(newCard, oldCard);
        },
        hover: (_item, monitor) => {
            if (monitor.isOver()) props.setHighlightedCardId(props.card.id);

            const initialOffset = monitor.getInitialClientOffset();
            if (monitor.getClientOffset()!.y < initialOffset!.y) {
                setDisplayDroppableCardAbove(true);
                setDisplayDroppableCardBelow(false);
            }
            if (monitor.getClientOffset()!.y > initialOffset!.y) {
                setDisplayDroppableCardBelow(true);
                setDisplayDroppableCardAbove(false);
            }
        }
    });

    // allows for the Card component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref}>
            {displayDroppableCardAbove === true && props.highlightedCardId === props.card.id && isDragging === false &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card droppable-card'></div>
            }
            {isDragging === false &&
                <div
                    ref={cardRef}
                    className={'card trello-card ' + (props.hoverCardId === props.card.id && onDesktop ? 'active-card' : '')}
                    onMouseOver={() => { if (props.isDragInProgress === false && onDesktop) props.setHoverCardId(props.card.id) }}
                    onMouseLeave={() => { if (onDesktop) props.setHoverCardId(0) }}
                    onClick={() => history.push(Path.Card.replace(':id', props.card.id.toString()))}>
                    <span>{isDragging === false && props.card.title}</span>
                </div>
            }
            {isDragging === true && props.highlightedCardId === props.dragCardId &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card placeholder-card'></div>
            }
            {displayDroppableCardBelow === true && props.highlightedCardId === props.card.id && isDragging === false &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card droppable-card'></div>
            }
        </div>
    )
}