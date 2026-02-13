import { Transform } from "node:stream";

export class FilterByCountry extends Transform {
  constructor(country, opts = {}) {
    opts.objectMode = true;
    super(opts);
    this.country = country;
  }

  _transform(record, _enc, cb) {
    // Transform filter
    if (record.country === this.country) {
      this.push(record);
    }
    cb();
  }
}
