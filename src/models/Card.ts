export class CardModel {
    readonly CardId: number;
    readonly Title: string;
    readonly ColumnId: number;
    readonly ColumnIndex: number;

    constructor(cardId: number, title: string, columnId: number, columnIndex: number) {
        this.CardId = cardId;
        this.Title = title;
        this.ColumnId = columnId;
        this.ColumnIndex = columnIndex;
    }
}