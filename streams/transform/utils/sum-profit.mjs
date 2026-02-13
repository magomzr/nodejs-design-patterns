import { Transform } from "node:stream";

export class SumProfit extends Transform {
  constructor(opts = {}) {
    opts.objectMode = true;
    super(opts);
    this.total = 0;
  }

  // El cb() que se pone acá es algo que Node.js internamente se encarga de pasar al método.
  // No lo hacemos nosotros, sino que lo provee Node.js.

  // Usa el transform() para procesas data y acumular resultado parcial.
  _transform(record, _enc, cb) {
    this.total += Number.parseFloat(record.profit);
    // No estamos llamando this.push(), por lo que ningún valor es emitido.
    // Para indicar que el record actual se ha procesado y el stream está listo
    // para recibir el próximo record.
    cb();
  }

  // Este método se llama automáticamente cuando se llama el .end() en el stream de entrada.
  // Usa este método para emitir el resultado cuando toda la data haya sido procesada.
  _flush(cb) {
    // this.push( this.total.toString()); // Se emite el valor final.
    this.push(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(this.total),
    );
    cb(); // Avisa que terminó el flush.
  }
}
