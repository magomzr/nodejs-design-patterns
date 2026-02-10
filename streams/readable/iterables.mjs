// Se pueden crear streams a partir de iterables, como arrays,
// generators, iterators y async iterators, usando
// Readable.from().

// Sin embargo, se debe tener en cuenta que no es apto para grandes
// arrays. Si se quisieran cargar muchos elementos de una lista siguiendo
// esta estructura, tocaría reservar en memoria mucho espacio, sin importar
// que se siga consumiendo por medio de un Readable, puesto que se está
// consumiendo la data de forma precargada. Siempre será mejor utilizar
// streams nativos como fstat.createReadStream o utilizar Readable.from con
// lazy iterables como generatos o async iterators.

import { Readable } from "node:stream";

const mountains = [
  { name: "Everest", height: 8848 },
  { name: "K2", height: 8611 },
  { name: "Kangchenjunga", height: 8586 },
  { name: "Lhotse", height: 8516 },
  { name: "Makalu", height: 8481 },
];

Readable.from(mountains).on("data", (mountain) => {
  console.log(`${mountain.name.padStart(14)}\t${mountain.height}m`);
});
