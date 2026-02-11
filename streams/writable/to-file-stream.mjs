// Se peude implementar un stream de tipo Writable heredando de la clase
// Writable de Node.js e implementando el método _write.

// La idea es escribir un stream Writable que reciba objetos en el siguiente formato:

// {
//     path: <path del archivo>,
//     content: <string o buffer con el contenido del archivo>
// }

// Para cada uno de estos objetos, el content se va a almacenar en un
// archivo con el path indicado. De este modo, el stream debe trabajar en
// modo objectMode.

import { Writable } from "node:stream";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { mkdirp } from "mkdirp";

export class ToFileStream extends Writable {
  constructor(opts) {
    super({ ...opts, objectMode: true });
  }

  _write(chunk, _encoding, cb) {
    // El param _encoding hace sentido cuando se trabaja en modo binario,
    // pero como estamos en modo objectMode, no lo vamos a usar.
    // Tampoco se usa cuando la propiedad decodeStrings de los options es false.
    mkdirp(dirname(chunk.path))
      // También se puede usar fs.appendFile() si queremos agregar contenido
      // a un archivo existente en lugar de sobrescribirlo.
      .then(() => fs.writeFile(chunk.path, chunk.content))
      .then(() => cb())
      .catch(cb);
  }
}

// Versión compacta
const tfs2 = new Writable({
  objectMode: true,
  write(chunk, _encoding, cb) {
    mkdirp(dirname(chunk.path))
      .then(() => fs.writeFile(chunk.path, chunk.content))
      .then(() => cb())
      .catch(cb);
  },
});

// Para probar el código, procedemos:

const tfs = new ToFileStream();

const outDir = join(import.meta.dirname, "files");

tfs.write({ path: join(outDir, "file1.txt"), content: "Hello" });
tfs.write({ path: join(outDir, "file1.txt"), content: "Node.js" });
tfs.write({ path: join(outDir, "file1.txt"), content: "streams" });
tfs.end(() => {
  console.log("All files have been written");
});
