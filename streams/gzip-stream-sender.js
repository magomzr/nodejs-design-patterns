// Aplicación del lado del cliente que enviará un archivo comprimido con gzip a un servidor.

// Para crear la petición que enviaremos al servidor
import { request } from "http";

// Para crear un stream de Transform, que comprimirá los datos que enviamos
import { createGzip } from "zlib";

// Para crear un stream de lectura para leer el archivo que vamos a enviar
import { createReadStream } from "fs";

// Para obtener el nombre del archivo que vamos a enviar
import { basename } from "path";

// Para añadir encriptación del lado del cliente, usamos este Transform y este método
import { createCipheriv, randomBytes } from "crypto";

// Nombre del archivo a enviar. "node gzip-stream-sender.js archivo.txt"
const filename = process.argv[2];

// "localhost" (opcional) o dirección IP del servidor al que se enviará el archivo.
const serverHost = process.argv[3];

// Obtenemos el secreto de encriptación desde la línea de comandos.
// Esperamos que sea un string hexadecimal, que podamos cargar en memoria usando un buffer
// definido en modo 'hex'.
const secret = Buffer.from(process.argv[4], 'hex');

// Generamos una secuencia aleatoria de bytes para el vector de inicialización
// del algoritmo de cifrado. Esto es necesario para que el cifrado sea seguro.
const iv = randomBytes(16);

const httpRequestOptions = {
  hostname: serverHost || "localhost",
  port: 3000,
  path: "/",
  method: "PUT", // Método PUT para subir archivos al servidor
  headers: {
    "Content-Type": "application/octet-stream", // Datos binarios
    "Content-Encoding": "gzip", // Indica que está comprimido
    "X-Filename": basename(filename), // Nombre del archivo (header personalizado)
    "X-Initialization-Vector": iv.toString('hex'), // Enviamos el IV en formato hexadecimal
  },
};

// Creamos la petición (NO se ejecuta hasta que se envíe el stream). No se envía el archivo aún.
// Sólo creamos el objeto `req` que representa la petición HTTP al servidor.
const req = request(httpRequestOptions, (res) => {
  // Este callback se ejecuta cuando el servidor responde
  console.log(`Respuesta del servidor: ${res.statusCode} ${res.statusMessage}`);
});

createReadStream(filename) // Readable: Lee el archivo.
  .pipe(createGzip()) // Transform: Comprime el archivo antes de enviarlo
  .pipe(createCipheriv('aes-192-ccm', secret, iv)) // Transform: Encripta el archivo comprimido
  .pipe(req) // Writable: Envía el archivo comprimido al servidor - Aquí se dispara la petición HTTP.
  .on("finish", () => {
    console.log(`Archivo ${filename} enviado al servidor ${serverHost}`);
  });

/*
La petición HTTP se inicia cuando empieza a escribir datos en `req`, que es un Writable stream.
Esto sucede en el momento en que se llama a `pipe(req)`, lo que envía los datos comprimidos al servidor.

Es importante tener en cuenta que es UNA SOLA petición HTTP que se envía al servidor, no X peticiones separadas.
En `req` creamos UNA sola petición.
En el .pipe(req) se inicia la petición HTTP única.

Eso quiere decir que se abre una conexión HTTP al servidor, los datos se envían en chunks a través de
esa misma conexión, cada chunk se comprime y se envía al servidor por la conexión abierta; la conexión se mantiene
abierta hasta que todos los datos se envían y, finalmente, se cierra la conexión cuando termina.

Cliente                    Servidor
  |                          |
  |------ HTTP PUT --------->| (Inicia conexión)
  |                          |
  |- chunk 1 comprimido ---->|
  |- chunk 2 comprimido ---->|
  |- chunk 3 comprimido ---->|
  |        ...               |
  |- chunk 1000 comprimido ->|
  |                          |
  |<----- HTTP Response -----|
  |                          |
  X                          X (Cierra conexión)

Las ventajas de este enfoque es que es eficiente, puesto que es una sola conexión TCP/HTTP.
*/
