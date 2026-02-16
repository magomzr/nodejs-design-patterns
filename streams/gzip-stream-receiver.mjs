/*

** Streams
Los streams son flujos de datos que se procesan de manera secuencial y eficiente, permitiendo trabajar
en chunks o fragmentos de datos en lugar de cargar en memoria de una vez.

Existen distintos tipos de streams:
- Readable: Permite leer datos de una fuente, como un archivo o una solicitud HTTP. Son de sólo lectura.
- Writable: Permite escribir datos en un destino, como un archivo o una respuesta HTTP. Son de sólo escritura.
- Duplex: Permite tanto leer como escribir datos, como un socket TCP.
- Transform: Permite modificar los datos a medida que se leen o escriben, como la compresión o descompresión de datos.

** Pipe
El método `pipe` conecta streams entre sí. Esto permite encadenar operaciones.
Los métodos que se pueden usar con `pipe` tienen que ser compatibles con el flujo de datos, es decir,
deben ser streams que puedan leer y escribir datos (de tipo Readable, Writable o Transform).

Si quisieramos crear métodos personalizados que puedan ser usados con `pipe`, tendríamos que implementar
los métodos `read` y `write` en nuestra clase, o extender de las clases `Readable`, `Writable` o `Transform`.

Generalmente cumplen esta estructura:

readable.pipe(intermedio1).pipe(intermedio2).pipe(destino);

donde:
- readable: SÓLO Readable (inicio).
- intermedio: Transform o Duplex (medio).
- destino: Writable, Transform o Duplex (final).

Esto es así porque:
- Transform streams: Procesan y pasan datos al siguiente
- Writable streams: Son el destino final, no pasan datos.
- Duplex streams: Pueden actuar como intermediarios.
- Readable streams: Sólo son el origen, no se usan medio del pipe.

Se pueden crear métodos personalizados, idealmente cuando se necesiten moficiar datos mientras fluyen, validar
información, filtrar contenido o convertir formatos. Para esto se tiene un resumen de los métodos obligatorios:

// - `_read(size)`: Genera/produce datos. En tipo Readable.
// - `_write(chunk, encoding, callback)`: Consume/procesa datos. En tipo Writable.
// - `_transform(chunk, encoding, callback)`: Modifica/pasa datos. En tipo Transform.
// - `_read()` + `_write()`: Ambos comportamientos. En tipo Duplex.

Opcionales útiles:
// - `_final(callback)`: Indica que no habrá más datos. Al terminar. En tipo Transform y Writable.
// - `_flush(callback)`: Para datos pendientes. En tipo Transform.
// - `_destroy(error, callback)`: Para limpieza de recursos. En todos los tipos.

** Gzip
El formato gzip es un método de compresión de datos que reduce el tamaño de los archivos para transmitirlos
de manera más eficiente. Es ampliamente utilizado en la web para comprimir archivos estáticos y respuestas HTTP.

G - zip, Gzip: Comprime datos para reducir su tamaño.
G - unzip, Gunzip: Descomprime datos comprimidos con gzip.

*/

// Servidor que va a recibir un stream comprimido con gzip

// Para crear un servidor HTTP
import { createServer } from "node:http";

// createWriteStream permite crear un stream de escritura a un archivo.
// Esto nos permitirá guardar el archivo que recibimos en el sistema de archivos
// del servidor.
import { createWriteStream } from "node:fs";

// createGunzip permite descomprimir el stream que recibimos.
import { createGunzip } from "node:zlib";

// Para tomar únicamente el nombre del archivo que recibimos
// y evitar problemas de seguridad.
import { basename, join } from "node:path";

const server = createServer((req, res) => {
  const filename = basename(req.headers["x-filename"]); // Obtenemos el nombre del archivo
  const desFilename = join("uploads", filename); // Definimos la ruta donde se guardará el archivo

  console.log(`Recibiendo archivo: ${filename}`);

  // req es un stream que es usado por el servidor para recibir datos en chunks.
  req
    .pipe(createGunzip()) // Descomprimimos el stream recibido. Este es un transform stream.
    .pipe(createWriteStream(desFilename)) // Guardamos el archivo descomprimido. Este es un writable stream.
    .on("finish", () => {
      console.log(`Archivo ${filename} guardado en ${desFilename}`);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Archivo ${filename} recibido y guardado.`);
    });
});

server.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
