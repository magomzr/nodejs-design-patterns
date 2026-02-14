// Los streams tipo PassThrough son un tipo especial de stream Transform que se
// encargan de exponer (output) cada chunk de datos sin aplicar ninguna transformación.
// Lo hace importante para observabilidad o para implementar el late piping y los
// patrones de lazy stream.

// ** Observabilidad **
// Se puede crear un PassThrough para ver cuánta data está fluyendo a través de uno
// o más streams, adjuntándole un event listener al PassThrough y luego meter esta
// instancia en un pipeline de streams.

// Importaremos esto en el ejemplo de filtrado y agregación de datos.

import { PassThrough, Writable, Readable } from "node:stream";

let bytesWritten = 0;
const monitor = new PassThrough();
monitor.on("data", (chunk) => {
  bytesWritten += chunk.length;
});
monitor.on("finish", () => {
  console.log(`Total bytes: ${bytesWritten}`);
});

// Esto permite monitorear algo sin tener que tocar ninguno de los otros streams
// existentes en el pipeline. Se pueden tener muchos PassThroughs en un pipeline,
// con propósitos distintos.

// Nótese que se puede implementar una versión de este stream usando Transform,
// pero habría que asegurarse que cada chunk recibido se vuelva a emitir sin alguna
// modificación o delay.

// ** Late piping **
// El late piping surge de un problema cuando se tiene un stream Readable que ya ha
// comenzado a emitir datos, pero aún no se ha conectado a ningún stream Writable.
// Esto es porque se hace el pipe() después de que se ha comenzado a emitir, por lo
// que se pueden haber perdido datos.

const readable = Readable.from(["a", "b", "c"]);
const writable = new Writable({
  write(chunk, _, cb) {
    console.log(chunk.toString());
    cb();
  },
});

readable.on("data", (chunk) => {
  // Aquí podría hacerse algo antes del pipe.
});
setTimeout(() => {
  // Late piping. Algunos datos ya pueden haberse emitido.
  readable.pipe(writable);
}, 1000);

// Para resolver este problema, se puede usar un PassThrough como placeholder, como
// intermediario entre el Readable y el Writable. Esto es así porque pasa los datos
// de entrada a salida sin modificarlos, actuándo como un búfer intermedio, donde se
// almacenan los datos hasta que el destino esté listo, evitando la pérdida de datos
// por late piping.

const passThrough = new PassThrough();

// Pipe desde el inicio
readable.pipe(passThrough);

// Más tarde, se conecta el destino.
setTimeout(() => {
  // Aquí no se pierden datos, porque el passThrough los almacena en
  // su búfer.
  passThrough.pipe(writable);
}, 100);

// Por tanto, hay que usar un PassThrough cuando se necesite proveer un placeholder
// para data que va a ser leída o escrita en el futuro.

// ** Lazy Stream **
// Un lazy stream es un stream que no empieza a procesar o emitir datos hasta que haya
// un consumidor conectado (es decir, cuando se le haga pipe() o se le agregue un listener
// a 'data'. Se empezará a emitir información, cuando tenga un receptor.

import { createReadStream } from "node:fs";

function getLazyFileStream(filepath) {
  const passThrough = new PassThrough();

  let started = false;
  passThrough.on("pipe", () => {
    if (!started) {
      started = true;
      const fileStream = createReadStream(filepath);
      fileStream.pipe(passThrough);
      fileStream.on("error", (err) => {
        passThrough.destroy(err);
      });
    }
  });

  return passThrough;
}

// Uso
const lazyStream = getLazyFileStream("archivo-grande.txt");

// El archivo no se abre ni se lee hasta que alguien lo consuma:
setTimeout(() => {
  // Aquí RECIÉN empieza la lectura y el flujo de datos.
  lazyStream.pipe(process.stdout);
}, 2000);

// Si en vez de un PassThrough se hubiera usado un stream Readable, el archivo se
// abriría y empezaría a leerse inmediatamente, incluso si nadie lo consume aún.
// Esto causa el problema del late piping y del uso innecesario de recursos, porque
// el archivo se abre y se leen datos aunque nadie los consuma.

// Acá, el PassThrough permite "esperar" hasta que realmente haya un consumidor
// antes de iniciar la lectura real.
