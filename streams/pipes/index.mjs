// Además de lo que ya conocemos sobre los pipes, es relevante hablar del
// manejo de errores en ellos. Normalmente, si un stream falla, el error no
// se propaga automáticamente por medio del pipe(), por lo que tocaría
// darles manejo manualmente si quisiéramos utilizar la estrategia.

/*
    stream1
      .on('error', handleError)
      .pipe(stream2)
      .on('error', handleError)
*/

// Para empeorar la situación, en caso de un error, el stream que falla sólo
// es desanclado del pipeline y no es propiamente destruido, dejando recursos
// abiertos (como file descriptors) y potencialmente causando memory leaks.

// Esto no es ideal y es engorroso. Para esto, podemos utilizar la función
// pipeline() de node:stream, pero tenemos dos de ellas:
// 1. pipeline(stream1, stream2, ..., callback) que viene de node:stream.
// 2. pipeline(stream1, stream2, ...) que viene de node:stream/promises
// y devuelve una promesa, por lo que podemos utilizar async/await.

import { createGzip, createGunzip } from "node:zlib";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const uppercasify = new Transform({
  transform(chunk, _enc, cb) {
    this.push(chunk.toString().toUpperCase());
    cb();
  },
});

await pipeline(
  process.stdin,
  createGunzip(),
  uppercasify,
  createGzip(),
  process.stdout,
);

// Podemos testear esto con un comando desde la terminal, por ejemplo:
// echo 'Hello World!' | gzip | node index.mjs | gunzip

// Si quisiéramos verlo fallar, podríamos quitar el step de gzip, quedando:
// echo 'Hello World!' | node index.mjs | gunzip
