export class CardModel {
    readonly Id: number;
    readonly Title: string;
    readonly ColumnId: number;
    readonly ColumnIndex: number;

    constructor(id: number, title: string, columnId: number, columnIndex: number) {
        this.Id = id;
        this.Title = title;
        this.ColumnId = columnId;
        this.ColumnIndex = columnIndex;
    }
}