import { Transform } from "node:stream";

export class ReplaceStream extends Transform {
  constructor(searchString, replaceString, options) {
    super({ ...options });
    this.searchString = searchString;
    this.replaceString = replaceString;
    this.tail = "";
  }

  _transform(chunk, _encoding, cb) {
    const pieces = (this.tail + chunk).split(this.searchString);
    const lastPiece = pieces[pieces.length - 1];
    const tailLength = this.searchString.length - 1;

    this.tail = lastPiece.slice(-tailLength);
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailLength);

    this.push(pieces.join(this.replaceString));
    cb();
  }

  _flush(cb) {
    this.push(this.tail);
    cb();
  }
}
