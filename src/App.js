import React, { useState } from 'react';
import { Column } from './components/Column';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

function App() {
	const [cards, setCards] = useState([]);

	const setParentCards = (title, columnId, cardId) => {
		setCards(cards.concat([{ title, cardId, columnId }]));
	};

	const moveCard = (oldCard, newCard) => {
		const foo = cards
			.filter(x => !(x.cardId === oldCard.cardId && x.columnId === oldCard.columnId))
			.concat([{ title: newCard.title, cardId: newCard.cardId, columnId: newCard.columnId }]);
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