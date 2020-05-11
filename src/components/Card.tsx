import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useHistory } from 'react-router-dom';
import { Path } from '../utilities/Enums';

declare interface ICardProps {
    readonly card: ICard;
    readonly dragCardHeight: number;
    readonly dragCardId: number;
    readonly isDragInProgress: boolean;

    /** determines which card is being hovered over */
    readonly highlightedCardId: number;

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
    const [isMouseHoveringOver, setIsMouseHoveringOver] = useState(false);

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
            const oldCard = item.card;
            const columnIndex = displayDroppableCardAbove === true
                ? props.card.columnIndex === 0
                    ? 0
                    : props.card.columnIndex - 1
                : props.card.columnIndex + 1;
            let newCard = { ...oldCard };
            newCard = { ...oldCard, column_id: props.card.column_id, columnIndex };
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
                    className={'card trello-card ' + (isMouseHoveringOver === true && props.isDragInProgress === false ? 'active-card' : '')}
                    onMouseOver={() => setIsMouseHoveringOver(true)}
                    onMouseLeave={() => setIsMouseHoveringOver(false)}
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