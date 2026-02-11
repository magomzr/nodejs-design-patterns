// Los streams de tipo Duplex son los que son Writable y Readable a la vez.
// Funciona cuando queremos una entidad que pueda ser fuente y destino de datos,
// como en el caso de los sockets de red.

// Como tenemos ambas capacidades, debemos implementar _read() y _write(), de los
// anteriores tipos de streams. El options que pasemos al constructor se reenvía a
// los constructores de Readable y Writable.

// Las opciones son las mismas, a diferencia de una nueva que tienen los Duplex,
// que es el allowHalfOpen que, si es false, hace que ambas partes del stream se
// cierren si una de ellas se cierra.

// Tendremos adicionalmente las propiedades readableObjectMode y writableObjectMode,
// que permiten que, por ejemplo, una parte reciba binarios y la otra reciba objetos.
