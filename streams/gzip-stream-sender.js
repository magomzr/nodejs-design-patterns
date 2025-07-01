// Aplicación del lado del cliente que enviará un archivo comprimido con gzip a un servidor.

// Para crear la petición que enviaremos al servidor
import { request } from "http";

// Para crear un stream de Transform, que comprimirá los datos que enviamos
import { createGzip } from "zlib";

// Para crear un stream de lectura para leer el archivo que vamos a enviar
import { createReadStream } from "fs";

// Para obtener el nombre del archivo que vamos a enviar
import path, { basename } from "path";

// Nombre del archivo a enviar. "node gzip-stream-sender.js archivo.txt"
const filename = process.argv[2];

// "localhost" (opcional) o dirección IP del servidor al que se enviará el archivo.
const serverHost = process.argv[3];

const httpRequestOptions = {
  hostname: serverHost || "localhost",
  port: 3000,
  path: "/",
  method: "PUT", // Método PUT para subir archivos al servidor
  headers: {
    "Content-Type": "application/octet-stream", // Datos binarios
    "Content-Encoding": "gzip", // Indica que está comprimido
    "X-Filename": basename(filename), // Nombre del archivo (header personalizado)
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
  .pipe(req) // Writable: Envía el archivo comprimido al servidor - Aquí se dispara la petición HTTP.
  .on("finish", () => {
    console.log(`Archivo ${filename} enviado al servidor ${serverHost}`);
  });

/*
La petición HTTP se inicia cuando empieza a escribir datos en `req`, que es un Writable stream.
Esto sucede en el momento en que se llama a `pipe(req)`, lo que envía los datos comprimidos al servidor.
*/