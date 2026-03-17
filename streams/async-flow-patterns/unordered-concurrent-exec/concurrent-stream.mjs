// Los streams concurrentes y sin orden no pueden ser usados cuando el orden de los
// datos a procesar es importante.

// A veces queremos procesar de datos sin importar el orden y aprovechando el potencial
// de concurrencia de Node.js. Si tenemos que ejecutar alguna petición async/await por
// cada data chunk, puede ser mejor procesar los chunks concurrentemente y agilizar
// el proceso. Esto sólo puede funcionar si no hay relación entre cada chunk, lo que
// suele ser común para object streams, pero no para los streams de texto o binarios.

import { Transform } from "node:stream";

export class ConcurrentStream extends Transform {
  // El userTransform es la función que implementará la lógica de transformación
  // que debe ejecutarse por cada objeto chunk que fluya en el stream.
  constructor(userTransformFunc, opts) {
    super({ objectMode: true, ...opts });
    this.userTransform = userTransformFunc;
    this.running = 0;
    this.terminateCb = null;
  }

  // En este método, se ejecuta el userTransform() e incrementamos el contador para
  // tareas concurrentes. Finalmente, notificamos al stream Transform que la actual
  // transformación se ha completado invocando done(). Siendo ese el truco para que
  // el stream Transform no espere. No estamos esperando a que el userTransform()
  // finalice para completar antes de invocar done(): lo hacemos inmediatamente.
  // Por aparte, proveemos el callback especial _onComplete(), que nos permite saber
  // cuándo el userTransform() ha finalizado.
  _transform(chunk, _enc, done) {
    this.running++;
    this.userTransform(
      chunk,
      _enc,
      this.push.bind(this),
      this._onComplete.bind(this),
    );
    done();
  }

  // Esto se invoca justo antes de que el stream Transform finalice, por si aún
  // existen tareas ejecutándose. Si es así, guardamos el callback done() para
  // invocarlo cuando todas las tareas concurrentes hayan finalizado.
  _flush(done) {
    if (this.running > 0) {
      this.terminateCb = done;
    } else {
      done();
    }
  }

  // Tenemos este método que se invoca cada vez que una tarea asíncrona finaliza.
  // Revisa si hay alguna otra tarea ejecutándose y, si no es así, invoca el
  // this.terminateCb() que hará que el stream Transform finalice, disparando el
  // evento 'finish', y ejecute el callback que se le pasó a _flush() para finalizar
  // el stream Transform. Esto es un método puesto a conveniencia como parte de nuestra
  // implementación de un stream Transform concurrente, pero no es un método especial
  // de los streams de Node.js que estemos sobreescribiendo.
  _onComplete(err) {
    this.running--;
    if (err) {
      return this.emit("error", err);
    }
    if (this.running === 0) {
      this.terminateCb?.();
    }
  }
}
