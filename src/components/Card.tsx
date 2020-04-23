import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { CardModel } from '../models/Card';

declare interface ICardProps {
    readonly title: string;
    readonly cardId: number;
    readonly columnId: number;
    readonly dragCardHeight: number;
    readonly columnIndex: number;
    readonly dragCardId: number;

    /** determines which card is being hovered over */
    readonly highlightedCardId: number;

    readonly setDragCardId: (cardId: number) => void;
    readonly setCardHeight: (cardId: number, height: number) => void;
    readonly moveCard: (cardId: number, newCard: CardModel, columnId: number) => void;
    readonly setHighlightedCardId: (cardId: number) => void;
}

declare interface IDraggableCard {
    readonly type: string;
    readonly title: string;
    readonly cardId: number;
    readonly columnId: number;
}

export function Card(props: ICardProps) {
    const ref = useRef(null);
    const cardRef = useRef<any>(null);
    const latestSetCardHeight = useRef(props.setCardHeight);

    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableCardAbove, setDisplayDroppableCardAbove] = useState(false);
    const [displayDroppableCardBelow, setDisplayDroppableCardBelow] = useState(false);

    useEffect(() => { latestSetCardHeight.current = props.setCardHeight });

    useEffect(() => {
        if (isDragging === false) {
            const cardHeight = cardRef.current.clientHeight;
            latestSetCardHeight.current(props.cardId, cardHeight);
        }
    }, [props.cardId, isDragging]);

    const [, drag] = useDrag({
        item: { type: 'card', title: props.title, cardId: props.cardId, columnId: props.columnId },
        collect: monitor => {
            if (monitor.isDragging()) setIsDragging(true)
            else {
                setIsDragging(false);
                setDisplayDroppableCardAbove(false);
                setDisplayDroppableCardBelow(false);
            }
        },
        begin: () => {
            props.setDragCardId(props.cardId);
            props.setHighlightedCardId(props.cardId);
        }
    });

    const [, drop] = useDrop({
        accept: 'card',
        drop: (item: IDraggableCard) => {
            const colIndex = displayDroppableCardAbove === true
                ? props.columnIndex
                : props.columnIndex + 1;
            const newCard = new CardModel(item.cardId, item.title, props.columnId, colIndex);
            props.moveCard(item.cardId, newCard, item.columnId);
        },
        hover: (_item, monitor) => {
            if (monitor.isOver()) props.setHighlightedCardId(props.cardId);

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
    })

    // allows for the Card component to be both dragged and dropped on
    drag(drop(ref));

    return (
        <div ref={ref}>
            {displayDroppableCardAbove === true && props.highlightedCardId === props.cardId && isDragging === false &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card droppable-card'></div>
            }
            {isDragging === false &&
                <div ref={cardRef} className='card trello-card'>
                    <span>{isDragging === false && props.title}</span>
                </div>
            }
            {isDragging === true && props.highlightedCardId === props.dragCardId &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card placeholder-card'></div>
            }
            {displayDroppableCardBelow === true && props.highlightedCardId === props.cardId && isDragging === false &&
                <div style={{ height: props.dragCardHeight }} className='card trello-card droppable-card'></div>
            }
        </div>
    )
}