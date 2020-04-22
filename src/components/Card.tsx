import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { CardModel } from '../models/Card';

declare interface ICardProps {
    readonly title: string;
    readonly cardId: number;
    readonly columnId: number;
    readonly moveCard: (cardId: number, newCard: CardModel, columnId: number) => void;

    /** determines which card is being hovered over */
    readonly highlightedCardId: number;

    readonly setHighlightedCardId: (cardId: number) => void;
    readonly columnIndex: number;
}

declare interface IDraggableCard {
    readonly type: string;
    readonly title: string;
    readonly cardId: number;
    readonly columnId: number;
}

export function Card(props: ICardProps) {
    const ref = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [displayDroppableCardAbove, setDisplayDroppableCardAbove] = useState(false);
    const [displayDroppableCardBelow, setDisplayDroppableCardBelow] = useState(false);

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
            {displayDroppableCardAbove === true && props.highlightedCardId === props.cardId && <div className='card trello-card droppable-card'></div>}
            <div className={'card trello-card ' + (isDragging === true ? 'hide' : '')}>
                <span>{isDragging === false && props.title}</span>
            </div>
            {displayDroppableCardBelow === true && props.highlightedCardId === props.cardId && <div className='card trello-card droppable-card'></div>}
        </div>
    )
}