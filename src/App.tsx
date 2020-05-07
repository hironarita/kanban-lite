import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Column } from './components/Column';
import { CardModel } from './models/Card';
import { ModalManager } from './components/ModalManager';
import { Path } from './utilities/Enums';
import { LoginSignup } from './components/LoginSignup';
import { get, post } from './utilities/Axios';
import { CustomDragLayer } from './components/CustomDragLayer';

declare interface IAppProps {
	readonly isLoggedIn: boolean;
}
function App(props: IAppProps) {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);
	const [columns, setColumns] = useState<IColumn[]>([]);
	const [highlightedColumnId, setHighlightedColumnId] = useState(0);
	const [columnIdToHeightMap, setColumnIdToHeightMap] = useState(new Map<number, number>());
	const [dragColumnId, setDragColumnId] = useState(0);
	const [dragCardId, setDragCardId] = useState(0);
	const [cardIdToHeightMap, setCardIdToHeightMap] = useState(new Map<number, number>());
	const [isDragInProgress, setIsDragInProgress] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn);
	const [isLoading, setIsLoading] = useState(false);

	const getColumnsCardsAndSetState = async () => {
		const columns = await get<IColumn[]>('/columns');
		setColumns(columns);
		const colIds = columns
			.map(x => x.id)
			.join(',');
		const cardData = await get<ReadonlyArray<ICard>>('/cards?columnIds=' + colIds);
		const cards = cardData.map(x => new CardModel(x.id, x.title, x.column_id, x.columnIndex));
		setCards(cards);
	};

	useEffect(() => {
		(async () => {
			if (isLoggedIn === true) {
				setIsLoading(true);
				try {
					await getColumnsCardsAndSetState();
				} finally {
					setIsLoading(false);
				}
			}
		})();
	}, [isLoggedIn]);

	const sortedColumns = columns.sort((x, y) => x.boardIndex > y.boardIndex ? 1 : -1);

	const dragColumnHeight = useMemo(() => columnIdToHeightMap.get(dragColumnId)!, [columnIdToHeightMap, dragColumnId]);

	const dragCardHeight = useMemo(() => cardIdToHeightMap.get(dragCardId)!, [cardIdToHeightMap, dragCardId]);

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

	const addColumn = async () => {
		const data = {
			title: '',
			boardIndex: columns.length
		};
		setIsLoading(true);
		try {
			await post('/columns/create', data);
			await getColumnsCardsAndSetState();
		} finally {
			setIsLoading(false);
		}
	};

	const changeColumnTitle = async (id: number, newTitle: string) => {
		const data = {
			id,
			title: newTitle
		};
		setIsLoading(true)
		try {
			await post('/columns/update', data);
			await getColumnsCardsAndSetState();
		} finally {
			setIsLoading(false);
		}
	};

	const moveColumn = async (oldColumnId: number, newColumn: IColumn, oldBoardIndex: number) => {
		const clonedColumns = columns.sort((x, y) => x.boardIndex > y.boardIndex ? 1 : -1);
		clonedColumns.splice(newColumn.boardIndex, 0, newColumn);
		const newColumns = clonedColumns
			.filter(x => !(x.id === oldColumnId && x.boardIndex === oldBoardIndex))
			.map((x, i) => ({ ...x, boardIndex: i}));
		setColumns(newColumns);
		let data = {};
		for (let i = 0; i < newColumns.length; i++) {
			data = { ...data, [newColumns[i].id]: i };
		}
		await post('/columns/move', data);
	};

	const setColumnHeight = (columnId: number, height: number) => {
		const clone = new Map(columnIdToHeightMap);
		clone.set(columnId, height);
		setColumnIdToHeightMap(clone);
	};

	const setCardHeight = useCallback((cardId: number, height: number) => {
		const clone = new Map(cardIdToHeightMap);
		clone.set(cardId, height);
		setCardIdToHeightMap(clone);
	}, [cardIdToHeightMap]);

	const logout = async () => {
		setIsLoading(true)
		try {
			await get('/account/logout');
			setIsLoggedIn(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Router>
			{isLoggedIn === true
				? <div>
					<div className='d-flex mt-3'>
						<h1 className='logged-in-logo'>Kanban Lite</h1>
						<button
							className='btn log-out-btn'
							onClick={() => logout()}
							disabled={isLoading === true}>
							Log Out
						</button>
					</div>
					<DndProvider backend={Backend}>
						<CustomDragLayer />
						<div className='trello-container'>
							{sortedColumns.map(x =>
								<div key={x.id}>
									<Column
										column={x}
										highlightedColumnId={highlightedColumnId}
										dragColumnId={dragColumnId}
										dragColumnHeight={dragColumnHeight}
										dragCardId={dragCardId}
										dragCardHeight={dragCardHeight}
										isDragInProgress={isDragInProgress}
										cards={cards.filter(y => y.ColumnId === x.id)}
										setIsDragInProgress={(x: boolean) => setIsDragInProgress(x)}
										setCardHeight={(cardId: number, height: number) => setCardHeight(cardId, height)}
										setDragCardId={(cardId: number) => setDragCardId(cardId)}
										setDragColumnId={(columnId: number) => setDragColumnId(columnId)}
										setColumnHeight={(columnId: number, height: number) => setColumnHeight(columnId, height)}
										changeColumnTitle={(columnId: number, newTitle: string) => changeColumnTitle(columnId, newTitle)}
										setHighlightedColumnId={(id: number) => setHighlightedColumnId(id)}
										moveCard={(oldCardId: number, newCard: CardModel, oldColumnId: number) => moveCard(oldCardId, newCard, oldColumnId)}
										moveColumn={(oldColumnId: number, newColumn: IColumn, oldBoardIndex: number) => moveColumn(oldColumnId, newColumn, oldBoardIndex)}
										getColumnsAndCards={() => getColumnsCardsAndSetState()}
										setIsLoading={(x: boolean) => setIsLoading(x)}
										isLoading={isLoading} />
								</div>
							)}
							<div>
								<button
									type='button'
									onClick={() => addColumn()}
									className='btn add-column-button'
									disabled={isLoading === true}>
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