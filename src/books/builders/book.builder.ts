export class BookBuilder {
  private _title!: string;
  private _author!: string;
  private totalCopies = 1;

  setTitle(title: string): BookBuilder {
    this._title = title;
    return this;
  }

  setAuthor(author: string): BookBuilder {
    this._author = author;
    return this;
  }

  setTotalCopies(copies: number): BookBuilder {
    this.totalCopies = copies;
    return this;
  }

  build() {
    return {
      title: this._title,
      author: this._author,
      totalCopies: this.totalCopies,
    };
  }
}