// La lectura con 'readable' puede hacerse completa igual, como un búfer.
process.stdin
  .on("readable", () => {
    let chunk;
    console.log("New data available");
    while ((chunk = process.stdin.read()) !== null) {
      console.log(`Chunk read (${chunk.length} bytes): "${chunk.toString()}"`);
    }
  })
  .on("end", () => console.log("End of stream"));

// Por otra parte, puede hacerse por medio de flujos, con 'data'. Esto permite
// enviar de chunk en chunk.
process.stdin
  .on("data", (chunk) => {
    console.log("New data available");
    console.log(`Chunk read (${chunk.length} bytes): "${chunk.toString()}"`);
  })
  .on("end", () => console.log("End of stream"));
