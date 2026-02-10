// Un stream Writable representa un lugar de destino de los datos.
// Esto puede ser un archivo en el filesystem, una base de datos, un socket,
// el output de stdin y de stdout, etc.

// Debe seguir:         writable.write(chunk, [encoding], [callback])
// Para indicar que ya no se escribirá más data en el stream,
// se utiliza:          writable.end([chunk], [encoding], [callback])

// Usaremos un pequeño servidor HTTP que devuelve un string random para esto.
// Para testearlo, usaremos curl para hacerle peticiones.
// curl -i --raw localhost:3000
// -i para incluir los headers de respuesta.
// --raw deshabilita decodings internos y permite ver la respuesta completa.

import { createServer } from "node:http";
import Chance from "chance";

const chance = new Chance();

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  do {
    res.write(`${chance.string()}\n`);
  } while (chance.bool({ likelihood: 95 }));
  res.end("\n\n");
  res.on("finish", () => console.log("All data sent"));
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
