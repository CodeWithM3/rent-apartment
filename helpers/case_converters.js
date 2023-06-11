// make a function which converts snake case to camel case
function toCamel(s) {
    return s.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });
  }
  
  function toSnakeCase(str = '') {
    const strArr = str.split(' ');
    const snakeArr = strArr.reduce((acc, val) => {
      return acc.concat(val.toLowerCase());
    }, []);
    return snakeArr.join('_');
  }
  
  module.exports = {
    toCamel,
    toSnakeCase
  }