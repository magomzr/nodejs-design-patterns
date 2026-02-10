console.log("Previous __filename:", import.meta.filename); // /path/to/project/main.js
console.log("Previous __dirname:", import.meta.dirname); // /path/to/project

// Important
console.log(import.meta);
/*
  {
    dirname: "C:\\Users\\mgome\\Documents\\dev\\nodejs-design-patterns",
    filename: "C:\\Users\\mgome\\Documents\\dev\\nodejs-design-patterns\\index.mjs",
    main: true,
    resolve: [Function: resolve,
    url: "file:///C:/Users/mgome/Documents/dev/nodejs-design-patterns/index.mjs",
  };
*/
