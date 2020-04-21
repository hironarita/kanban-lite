import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';

function App() {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);

	const setParentCards = (title: string, columnId: number, cardId: number, columnIndex: number) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId: number, newCard: CardModel) => {
		const clonedCards = cards.slice();
		clonedCards.splice(newCard.ColumnIndex, 0, newCard);
		const filtered = clonedCards.filter(x => x.CardId !== oldCardId);
		const newCards = filtered.map((x, i) => new CardModel(x.CardId, x.Title, x.ColumnId, i));
		setCards(newCards);
	};

	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				<div>
					<Column
						columnId={0}
						setParentCards={(title: string, columnId: number, cardId: number, columnIndex: number) => setParentCards(title, columnId, cardId, columnIndex)}
						cards={cards}
						moveCard={(oldCardId: number, newCard: CardModel) => moveCard(oldCardId, newCard)} />
				</div>
				<div>
					<button type='button' className='btn btn-secondary'>+ Add another list</button>
				</div>
			</div>
		</DndProvider>
	);
}

export default App;