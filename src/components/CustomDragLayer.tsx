import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import TextareaAutosize from 'react-textarea-autosize';
import { IDraggableColumn } from './Column';

export const CustomDragLayer = () => {
    const getItemStyles = (initialOffset: XYCoord | null, currentOffset: XYCoord | null) => {
        if (!initialOffset || !currentOffset) {
            return {
                display: "none"
            };
        }

        let { x, y } = currentOffset;

        x -= initialOffset.x;
        y -= initialOffset.y;
        x += initialOffset.x;
        y += initialOffset.y;

        const transform = `translate(${x}px, ${y}px)`;
        return {
            transform,
            WebkitTransform: transform
        };
    }

    const {
        initialOffset,
        currentOffset,
        item
    } = useDragLayer(monitor => ({
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        item: monitor.getItem() as IDraggableColumn
    }));

    const cards = item && item.cards
        .slice()
        .sort((x, y) => x.ColumnIndex > y.ColumnIndex ? 1 : -1);

    return (
        <div className='custom-drag-layer-container'>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {item &&
                    <div className='column custom-drag-layer'>
                        <div className='mb-2'>
                            <TextareaAutosize
                                type='text'
                                className='column-title'
                                defaultValue={item.title} />
                        </div>
                        {cards.map(x => (
                            <div key={x.Id} className='card trello-card'>
                                <span>{x.Title}</span>
                            </div>
                        ))}
                        <button
                            type='button'
                            className='btn add-card-button mt-2'>
                            + Add a card
                        </button>
                    </div>
                }
            </div>
        </div>
    )
};