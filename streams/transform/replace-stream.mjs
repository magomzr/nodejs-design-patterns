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

// Versión compacta
const searchString = "World";
const replaceString = "Node.js";
let tail = "";

const replaceStream = new Transform({
  defaultEncoding: "utf-8",

  transform(chunk, _encoding, cb) {
    const pieces = (tail + chunk).split(searchString);
    const lastPiece = pieces[pieces.length - 1];
    const tailLength = searchString.length - 1;
    tail = lastPiece.slice(-tailLength);
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailLength);
    this.push(pieces.join(replaceString));
    cb();
  },

  flush(cb) {
    this.push(tail);
    cb();
  },
});
