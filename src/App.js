import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';

function App() {
	const [cards, setCards] = useState([]);

	const setParentCards = (title, columnId, cardId) => {
		const card = new CardModel(cardId, title, columnId);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCard, newCard) => {
		const foo = cards
			.filter(x => !(x.CardId === oldCard.CardId && x.ColumnId === oldCard.ColumnId))
			.concat([newCard]);
		setCards(foo);
	};

	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				{Array.from({ length: 2 }).map((_x, i) =>
					<Column
						key={i}
						columnId={i}
						setParentCards={(title, columnId, cardId) => setParentCards(title, columnId, cardId)}
						cards={cards}
						moveCard={(oldCard, newCard) => moveCard(oldCard, newCard)} />
				)}
			</div>
		</DndProvider>
	);
}

export default App;