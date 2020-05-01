import React, { useState, useMemo, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import { Column } from './components/Column';
import { CardModel } from './models/Card';
import { ColumnModel } from './models/Column';
import { ModalManager } from './components/ModalManager';
import { Path } from './utilities/Enums';
import { LoginSignup } from './components/LoginSignup';

declare interface IAppProps {
	readonly isLoggedIn: boolean;
}
function App(props: IAppProps) {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);
	const toDoColumn = new ColumnModel(Date.now(), 'To Do', 0);
	const [columns, setColumns] = useState<ReadonlyArray<ColumnModel>>([toDoColumn]);
	const [highlightedColumnId, setHighlightedColumnId] = useState(0);
	const [columnIdToHeightMap, setColumnIdToHeightMap] = useState(new Map<number, number>());
	const [dragColumnId, setDragColumnId] = useState(0);
	const [dragCardId, setDragCardId] = useState(0);
	const [cardIdToHeightMap, setCardIdToHeightMap] = useState(new Map<number, number>());
	const [isDragInProgress, setIsDragInProgress] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn);

	const sortedColumns = columns
		.slice()
		.sort((x, y) => x.BoardIndex > y.BoardIndex ? 1 : -1);

	const dragColumnHeight = useMemo(() => columnIdToHeightMap.get(dragColumnId)!, [columnIdToHeightMap, dragColumnId]);

	const dragCardHeight = useMemo(() => cardIdToHeightMap.get(dragCardId)!, [cardIdToHeightMap, dragCardId]);

	const setParentCards = (title: string, columnId: number, cardId: number, columnIndex: number) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId: number, newCard: CardModel, oldColumnId: number) => {
		const clonedCards = cards.slice();
		const allCardsExceptOldCard = clonedCards.filter(x => x.Id !== oldCardId);

		const newColumnCards = allCardsExceptOldCard.filter(x => x.ColumnId === newCard.ColumnId);
		newColumnCards.splice(newCard.ColumnIndex, 0, newCard);
		const newCards = newColumnCards.map((x, i) => new CardModel(x.Id, x.Title, x.ColumnId, i));

		// reset column indexes on cards in the old column
		let resetCards: CardModel[] = [];
		if (newCard.ColumnId !== oldColumnId) {
			resetCards = allCardsExceptOldCard
				.filter(x => x.ColumnId === oldColumnId)
				.map((x, i) => new CardModel(x.Id, x.Title, x.ColumnId, i));
		}

		const unchangedCards = allCardsExceptOldCard
			.filter(x => x.ColumnId !== newCard.ColumnId)
			.filter(x => x.ColumnId !== oldColumnId);
		setCards(unchangedCards.concat(newCards).concat(resetCards));
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

	const setColumnHeight = useCallback((columnId: number, height: number) => {
		const clone = new Map(columnIdToHeightMap);
		clone.set(columnId, height);
		setColumnIdToHeightMap(clone);
	}, [columnIdToHeightMap]);

	const setCardHeight = useCallback((cardId: number, height: number) => {
		const clone = new Map(cardIdToHeightMap);
		clone.set(cardId, height);
		setCardIdToHeightMap(clone);
	}, [cardIdToHeightMap]);

	const logout = async () => {
		await axios.get('http://localhost:3000/account/logout', { withCredentials: true });
		setIsLoggedIn(false);
	};

	return (
		<Router>
			{isLoggedIn === true
				? <div>
					<div className='d-flex align-items-center w-100 justify-content-between'>
						<h1 className='logged-in-logo'>Kanban Lite</h1>
						<button className='btn log-out-btn mt-2' onClick={() => logout()}>Log Out</button>
					</div>
					<DndProvider backend={Backend}>
						<div className='trello-container'>
							{sortedColumns.map((x, i) =>
								<div key={x.Id}>
									<Column
										columnId={x.Id}
										boardIndex={x.BoardIndex}
										highlightedColumnId={highlightedColumnId}
										title={x.Title}
										cardCount={cards.filter(y => y.ColumnId === x.Id).length}
										dragColumnId={dragColumnId}
										dragColumnHeight={dragColumnHeight}
										dragCardId={dragCardId}
										dragCardHeight={dragCardHeight}
										isDragInProgress={isDragInProgress}
										cards={cards}
										setIsDragInProgress={(x: boolean) => setIsDragInProgress(x)}
										setCardHeight={(cardId: number, height: number) => setCardHeight(cardId, height)}
										setDragCardId={(cardId: number) => setDragCardId(cardId)}
										setDragColumnId={(columnId: number) => setDragColumnId(columnId)}
										setColumnHeight={(columnId: number, height: number) => setColumnHeight(columnId, height)}
										changeColumnTitle={(columnId: number, newTitle: string, boardIndex: number) => changeColumnTitle(columnId, newTitle, boardIndex)}
										setHighlightedColumnId={(id: number) => setHighlightedColumnId(id)}
										setParentCards={(title: string, columnId: number, cardId: number, columnIndex: number) => setParentCards(title, columnId, cardId, columnIndex)}
										moveCard={(oldCardId: number, newCard: CardModel, oldColumnId: number) => moveCard(oldCardId, newCard, oldColumnId)}
										moveColumn={(oldColumnId: number, newColumn: ColumnModel) => moveColumn(oldColumnId, newColumn)} />
								</div>
							)}
							<div>
								<button
									type='button'
									onClick={() => addColumn()}
									className='btn add-column-button'>
									+ Add another list
								</button>
							</div>
						</div>
					</DndProvider>
				</div>
				: <LoginSignup logIn={() => setIsLoggedIn(true)} />
			}
			<Route path={Path.Card}>
				<ModalManager />
			</Route>
		</Router>
	);
}

export default App;