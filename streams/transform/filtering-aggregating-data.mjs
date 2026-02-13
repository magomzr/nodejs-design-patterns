// Los streams de tipo Transform son una buena herramienta en los pipelines de
// transformación de datos. Además de reemplazar palabras, comprimir y encriptar,
// también se pueden utilizar para filtrar y agregar datos.

// Los streams de Node.js pueden procesar grandes cantidades de datos incrementalmente,
// sin sobrecargar la memoria, haciéndolos escalables y eficientes.

// Supongamos una empresa que solicita analizar un gran archivo con sus ventas, en
// formato CSV, donde quieren obtener el total de ventas por productos en Italia.
// Este archivo contiene tres campos por línea, type, country y profit.

/*
type,country,profit
Household,Namibia,597290.92
Baby Food,Iceland,808579.10
Meat,Russia,277305.60
Meat,Italy,413270.00
Cereal,Malta,174965.25
Meat,Indonesia,145402.40
Household,Italy,728880.54
[... many more lines]
*/

// Debemos buscar las líneas que correspondan a Italia y sumar dicho profit.
// Podemos apoyarnos acá de csv-parse para procesar mejor los archivos CSV.

import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { Parser } from "csv-parse";
import { FilterByCountry } from "./utils/filter-by-country.mjs";
import { SumProfit } from "./utils/sum-profit.mjs";

const csvParser = new Parser({ columns: true });

createReadStream("data.csv.gz")
  .pipe(createGunzip())
  .pipe(csvParser)
  .pipe(new FilterByCountry("Italy"))
  .pipe(new SumProfit())
  .pipe(process.stdout);
