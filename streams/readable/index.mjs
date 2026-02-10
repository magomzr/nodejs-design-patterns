// Para implementar un stream de lectura, se debe crear una nueva clase que herede
// de 'Readable' de 'stream'. Dicha clase, debe implementar la función '_read(size)'.
//
// Internamente, la clase Readable ejecutará este método, y empezará a llenar el búfer
// interno que se tiene para ello, por medio de push().

// Vamos a instanciar la clase RandomStream usando el flowing mode.

import { RandomStream, simplifiedRandomStream } from "./random-stream.mjs";

const randomStream = new RandomStream();

// randomStream
simplifiedRandomStream
  .on("data", (chunk) => {
    console.log(`Chunk received (${chunk.length} bytes): ${chunk.toString()}`);
  })
  .on("end", () => {
    console.log("Finished");
  });
