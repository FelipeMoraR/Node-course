// console.log(arguments);
// console.log(require('module').wrapper);

const C = require('./test-module-1');
const calc1 = new C();

console.log(calc1.add(1, 3));

const cal2 = require('./test-module-2');
console.log(cal2.add(1, 3));

const { add, multiply } = require('./test-module-2');
console.log(add(1, 3));

// Caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
