import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';

function App() {
	const [cards, setCards] = useState([]);

	const setParentCards = (title, columnId, cardId, columnIndex) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId, newCard) => {
		const clonedCards = cards.slice();
		clonedCards.splice(newCard.ColumnIndex, 0, newCard);
		const filtered = clonedCards.filter(x => x.CardId !== oldCardId);
		const newCards = filtered.map((x, i) => new CardModel(x.CardId, x.Title, x.ColumnId, i));
		setCards(newCards);
	};

	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				<Column
					columnId={0}
					setParentCards={(title, columnId, cardId, columnIndex) => setParentCards(title, columnId, cardId, columnIndex)}
					cards={cards}
					moveCard={(oldCard, newCard) => moveCard(oldCard, newCard)} />
			</div>
		</DndProvider>
	);
}

export default App;