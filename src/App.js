import React from 'react';
import { Column } from './components/Column';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend'

function App() {
	return (
		<DndProvider backend={Backend}>
			<div className='trello-container'>
				<Column />
			</div>
		</DndProvider>
	);
}

export default App;