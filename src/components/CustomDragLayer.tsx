import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import TextareaAutosize from 'react-textarea-autosize';
import { IDraggableColumn } from './Column';
import { IDraggableCard } from './Card';

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
        item,
        itemType
    } = useDragLayer(monitor => ({
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        item: monitor.getItem() as IDraggableColumn | IDraggableCard,
        itemType: monitor.getItemType()
    }));

    const renderItem = () => {
        switch (itemType) {
            case 'column':
                return <div className='column custom-drag-layer'>
                    <div className='mb-2'>
                        <TextareaAutosize
                            type='text'
                            className='column-title'
                            defaultValue={(item as IDraggableColumn).column.title}
                            placeholder='Enter list title...' />
                    </div>
                    {(item as IDraggableColumn).cards.map(x => (
                        <div key={x.Id} className='card trello-card'>
                            <span>{x.Title}</span>
                        </div>
                    ))}
                    <button
                        type='button'
                        className='btn add-card-button mt-2'>
                        + Add a card
                    </button>
                </div>;
            case 'card':
                return <div className='card trello-card custom-drag-layer custom-drag-card'>
                    <span>{(item as IDraggableCard).title}</span>
                </div>;
            default:
                return null;
        }
    }

    if (!item) {
        return null;
    }
    return (
        <div className='custom-drag-layer-container'>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {renderItem()}
            </div>
        </div>
    )
};