// Vamos a implementar una aplicación de monitoreo del status de URLs.Queremos
// construir un servicio simple para monitorear el status de una gran lista de URLs,
// y que todas están contenidas en un archivo de texto y separadas por saltos de línea.

import { createInterface } from "node:readline";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { ConcurrentStream } from "./concurrent-stream.mjs";

const inputFile = createReadStream(process.argv[2]);
const fileLines = createInterface({
  input: inputFile,
});
const checkUrls = new ConcurrentStream(async (url, _enc, push, done) => {
  if (!url) {
    return done();
  }
  try {
    await fetch(url, {
      method: "HEAD",
      timeout: 5000,
      signal: AbortSignal.timeout(5000),
    });
    push(`${url} is up\n`);
  } catch (error) {
    push(`${url} is down: ${error.message}\n`);
  }
  done();
});
const outputFile = createWriteStream("results.txt");

await pipeline(fileLines, checkUrls, outputFile);

console.log("Todas las URLs han sido revisadas");
