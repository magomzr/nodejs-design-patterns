// Los streams tipo Transform son un tipo particular de Duplex que están diseñados
// específicamente para manejar transformaciones de datos, como el zlib.createGzip()
// o el crypto.createCipheriv().

// Es especial porque típicamente en un stream Duplex, la parte Readable y la parte
// Writable son independientes, no hay una conexión directa entre lo que se escribe
// y lo que se lee. Son agnósticos en ese sentido.

// Por otra parte, en un stream Transform, se modifica cada chunk que se recibe en la
// parte del Writable, y luego la parte modificada se vuelve disponible en el lado
// Readable.

// En el caso del ejemplo de compresión, cuando la data no comprimida es escrita en
// el lado Writable, su implementación de _write() se encarga de comprimirla y luego
// almacenarla en un búfer interno. Cuando se lee desde el otro lado, la versión ahora
// comprimida de la data es lo que se devuelve.

// Para implementar un stream Transform, a diferencia de un Duplex donde se implementa
// _read() y _write(), en un Transform se implementa un método llamado _transform() y
// un método _flush().
