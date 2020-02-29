// Loader for CoffeeScript as a Node.js library.
const object = require('./coffee-script');
for (let key in object) { const val = object[key]; exports[key] = val; }
