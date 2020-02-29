/* eslint-disable
    guard-for-in,
    no-restricted-syntax,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
// Loader for CoffeeScript as a Node.js library.
const object = require('./coffee-script');

for (const key in object) { const val = object[key]; exports[key] = val; }
