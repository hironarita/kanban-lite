import React, { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';
import { ColumnModel } from './models/Column';

function App() {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);
	const initialColumn = new ColumnModel(Date.now(), '', 0);
	const [columns, setColumns] = useState<ReadonlyArray<ColumnModel>>([initialColumn]);
	const [highlightedColumnId, sethighlightedColumnId] = useState(0);

	const sortedColumns = useMemo(() => columns
		.slice()
		.sort((x, y) => x.BoardIndex > y.BoardIndex ? 1 : -1), [columns]);

	const setParentCards = (title: string, columnId: number, cardId: number, columnIndex: number) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId: number, newCard: CardModel) => {
		const clonedCards = cards.slice();
		const filteredCards = clonedCards
			.filter(x => x.Id !== oldCardId)
			.filter(x => x.ColumnId === newCard.ColumnId);
		filteredCards.splice(newCard.ColumnIndex, 0, newCard);
		const newCards = filteredCards.map((x, i) => new CardModel(x.Id, x.Title, x.ColumnId, i));
		setCards(newCards);
	};

	const addColumn = () => {
		const clonedColumns = columns.slice();
		const newColumn = new ColumnModel(Date.now(), '', clonedColumns.length);
		clonedColumns.push(newColumn);
		setColumns(clonedColumns);
	};

	const changeColumnTitle = (columnId: number, newTitle: string, boardIndex: number) => {
		const clonedColumns = columns.slice();
		const filtered = clonedColumns.filter(x => x.Id !== columnId);
		const newColumn = new ColumnModel(columnId, newTitle, boardIndex);
		setColumns(filtered.concat([newColumn]));
	};

	const moveColumn = (oldColumnId: number, newColumn: ColumnModel) => {
		const clonedColumns = columns.slice();
		const filteredColumns = clonedColumns.filter(x => x.Id !== oldColumnId)
		filteredColumns.splice(newColumn.BoardIndex, 0, newColumn);
		const newColumns = filteredColumns.map((x, i) => new ColumnModel(x.Id, x.Title, i));
		setColumns(newColumns);
	};

	console.log('cards', cards);
	console.log('columns', columns);

	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				{sortedColumns.map((x, i) => 
					<div key={x.Id}>
						<Column
							columnId={x.Id}
							boardIndex={x.BoardIndex}
							highlightedColumnId={highlightedColumnId}
							title={x.Title}
							cards={cards}
							changeColumnTitle={(columnId: number, newTitle: string, boardIndex: number) => changeColumnTitle(columnId, newTitle, boardIndex)}
							setHighlightedColumnId={(id) => sethighlightedColumnId(id)}
							setParentCards={(title: string, columnId: number, cardId: number, columnIndex: number) => setParentCards(title, columnId, cardId, columnIndex)}
							moveCard={(oldCardId: number, newCard: CardModel) => moveCard(oldCardId, newCard)}
							moveColumn={(oldColumnId: number, newColumn: ColumnModel) => moveColumn(oldColumnId, newColumn)} />
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