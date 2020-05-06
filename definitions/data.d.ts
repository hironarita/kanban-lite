declare interface IColumn {
    readonly boardIndex: number;
    readonly createdAt: string;
    readonly id: number;
    readonly title: string;
    readonly updatedAt: string;
    readonly user_id: number;
}

declare interface ICard {
    readonly columnIndex: number;
    readonly column_id: number;
    readonly createdAt: string;
    readonly id: number;
    readonly title: string;
    readonly updatedAt: string;
}