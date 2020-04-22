export class ColumnModel {
    readonly Id: number;
    readonly Title: string;
    readonly BoardIndex: number;

    constructor(id: number, title: string, boardIndex: number) {
        this.Id = id;
        this.Title = title;
        this.BoardIndex = boardIndex;
    }
}