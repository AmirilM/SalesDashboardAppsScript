const fs = require('node:fs');
const vm = require('node:vm');

function loadFunctions(file, names, globals = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const context = { ...globals };
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.exports = { ${names.join(', ')} };`, context, { filename: file });
  return context.exports;
}

module.exports = { loadFunctions };
