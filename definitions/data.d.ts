declare interface IColumn {
    readonly boardIndex: number;
    readonly createdAt: string;
    readonly id: number;
    readonly title: string;
    readonly updatedAt: string;
    readonly user_id: number;

    /** not returned from server - manually addded on client side when moving columns */
    readonly isNew?: boolean;
}

declare interface ICard {
    readonly columnIndex: number;
    readonly column_id: number;
    readonly createdAt: string;
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly updatedAt: string;

    /** not returned from server - manually addded on client side when moving cards */
    readonly isNew?: boolean;
}