import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';

declare interface IColumn {
	readonly id: number;
	readonly index: number;
	readonly title: string;
}

function App() {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);
	const [columns, setColumns] = useState<ReadonlyArray<IColumn>>([{ id: Date.now(), index: 0, title: '' }]);

	const setParentCards = (title: string, columnId: number, cardId: number, columnIndex: number) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId: number, newCard: CardModel) => {
		const clonedCards = cards.slice();
		clonedCards.splice(newCard.ColumnIndex, 0, newCard);
		const newCards = clonedCards
			.filter(x => x.CardId !== oldCardId)
			.map((x, i) => new CardModel(x.CardId, x.Title, x.ColumnId, i));
		setCards(newCards);
	};

	const addColumn = () => {
		const clonedColumns = columns.slice();
		clonedColumns.push({ id: Date.now(), index: clonedColumns.length, title: '' });
		setColumns(clonedColumns);
	};

	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				{columns.map((x, i) => 
					<div key={x.id}>
						<Column
							columnId={x.id}
							setParentCards={(title: string, columnId: number, cardId: number, columnIndex: number) => setParentCards(title, columnId, cardId, columnIndex)}
							cards={cards}
							moveCard={(oldCardId: number, newCard: CardModel) => moveCard(oldCardId, newCard)} />
					</div>				
				)}
				<div>
					<button
						type='button'
						onClick={() => addColumn()}
						className='btn btn-secondary add-column-button'>
						+ Add another list
					</button>
				</div>
			</div>
		</DndProvider>
	);
}

export default App;