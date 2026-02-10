import { Readable } from "node:stream";
import Chance from "chance"; // Lo usamos para generar valores aleatorios.

const chance = new Chance();

export class RandomStream extends Readable {
  // Si el constructor sólo tuviera el super(), se puede omitir en general.
  // Sólo se pone el constructor cuando se va a realizar algo adicional.
  constructor(opts) {
    super(opts);
    this.emittedBytes = 0;
  }

  _read(size) {
    const chunk = chance.string({ length: size }); // Se genera un random string del size.
    this.push(chunk, "utf-8"); // Se hace push del string al búfer interno.
    this.emittedBytes += chunk.length;
    // Probabilidad del 5%
    if (chance.bool({ likelihood: 5 })) {
      this.push(null); // Esto se hace para mandar un EOF con null y finalizar el stream.
    }
  }
}

// Construcción simplificada

export const simplifiedRandomStream = new Readable({
  read(size) {
    const chunk = chance.string({ length: size });
    this.push(chunk, "utf-8");
    if (chance.bool({ likelihood: 5 })) {
      this.push(null);
    }
  },
});
