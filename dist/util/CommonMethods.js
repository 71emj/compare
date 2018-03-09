/** Common methods are factories
* // still need a lot of tweeking...
* // but atm works as a shared library for both interface
* toCase
* @param {string} flag - a factory function to generate different format of match methods
* @return {function}
* toCase("SIMPLE")/toCase("OR")/toCase("AND")
* @param {string || number || boolean || function} exprs - expression can be in a variety of type
* @param {any} vals - the value pass to switchCase when matched
* @param {fn} fn - callback function (optional), can be use to perform specific action after matched
* @param {string} flag - flag match to use the correct method to process input
* toAllOther - passing true to switchCase.match, making it the "default" case
* @param {any} vals - the value pass to switchCase when matched
* @param {function} fn - callback function, see toCase(..., fn)
* Ended
* @param {function} fn - callback function
*/

export function toCase(self, flag, interpret) {
  interpret = interpret || function (exprs) {
    return exprs;
  };
  return function (exprs, vals, fn) {
    self.match(interpret(exprs), vals, fn, flag);
    return this;
  };
}

export function toAllOther(self) {
  return function (vals, fn) {
    self.match(true, vals, fn, "SIMPLE");
    return this;
  };
}

export function Ended(self, debug) {
  debug = debug || function (opts) {
    var targets = opts ? self.testTargets[opts] : self.testTargets;
    console.log({ targets: targets, cases: self.history });
  };
  return function (fn) {
    return fn(debug, self.result);
  };
}