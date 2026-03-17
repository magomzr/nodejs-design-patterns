// Por defecto, los streams manejan la data de forma secuencial. Esto implica que
// el método _transform() no se va a invocar con el siguiente chunk de datos hasta
// que la invocación previa se complete llamando a callback().

import { createReadStream, createWriteStream } from "node:fs";
import { Readable, Transform } from "node:stream";

const concatFile = (dest, files) => {
  return new Promise((resolve, reject) => {
    const destStream = createWriteStream(dest);
    // Cada chunk es un string con la ruta a un archivo.
    Readable.from(files)
      .pipe(
        // Se crea este stream para manejar cada archivo en secuencia.
        new Transform({
          objectMode: true,
          transform(chunk, _enc, done) {
            // Por cada chunk (que es un archivo), se crea un stream Readable para leer
            // el contenido del archivo y se le hace pipe con destStream (stream de escritura
            // para el archivo destino). Nos aseguramos de no cerrar destStream con la flag
            // end: false, ya que queremos seguir escribiendo en él con los siguientes archivos.
            const src = createReadStream(chunk);
            src.pipe(destStream, { end: false });
            // Esto es lo mismo que (err => done(err))
            src.on("error", done);
            // Esto es lo mismo que (() => done())
            // Cuando todos los contenido se han conectado a destStream, se invoca la
            // función done() para comunicar la completitud de la operación.
            src.on("end", done);
          },
        }),
      )
      .on("error", (err) => {
        destStream.end();
        reject(err);
      })
      // Cuando todos los archivos se han procesado, este evento se dispara, por lo que
      // podemos cerrar con seguridad el strem de escritura destStream e invocar el
      // callback de concatFiles(), que indica al completitud de toda la operación.
      .on("finish", () => {
        destStream.end();
        resolve();
      });
  });
};

try {
  await concatFile(process.argv[2], process.argv.slice(3));
} catch (error) {
  console.error(error);
  process.exit(1);
}

console.log("Todos los archivos se concatenaron exitosamente.");
