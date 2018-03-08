var SwitchCase = require("./SwitchCase");

function InterfaceClosure(simpleExp, config) {
  "use strict";

  var self = new SwitchCase();
  var Interface = {};
  var securityConfig = {
    limit: 50,
    keywords: ["document", "window", "process"]
  };
  var rules = Object.assign(securityConfig, config);

  /** Helpers to support interface functionality
  * debug
  * @param {string} opts - takes a string to specified behavior
  * filter
  * @param {array} exprs - filter prohibited syntax
  * verbose
  * @param {array} exprs - transform simple expression into verbose form, "home" --> name === "home"
  * interpret
  * @param {array || string} expr - interface to verbose + filter
  */
  var debug = function debug(opts) {
    var targets = opts ? self.testTargets[opts] : self.testTargets;
    console.log({ targets: targets, cases: self.history });
  };
  var filter = function filter(exprs) {
    var pattern = rules.keywords.join("|") + "|.{" + rules.limit + ",}";
    var regexp = new RegExp(pattern);
    var testing = function testing(elem) {
      return !self._type(elem, "function") && regexp.test(elem) ? true : false;
    };
    return !!exprs.filter(testing)[0];
  };
  var verbose = function verbose(exprs) {
    if (self._type(exprs, "function")) {
      return exprs;
    }
    var name = self.testTargets.args[0];
    var mapping = function mapping(expr) {
      var simple = expr.toString().match(/^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/);
      return simple && !self._type(expr, "boolean") ? name + " " + (simple[2] || (+expr ? "==" : "===")) + " \"" + (simple[1] || simple[3]) + "\"" : expr;
    }; // mathcing in sequence of "value", "operator", "following value"
    return exprs.map(mapping);
  };
  var interpret = function interpret(expr) {
    var exprs = self._isArray(expr);
    if (filter(exprs)) {
      throw new Error("individual expression must not exceed more than " + rules.limit + " characters " + ("and must not contain keywords such as " + rules.keywords.join(", ") + " etc."));
    }
    return simpleExp ? verbose(exprs) : exprs;
  };

  /** Interface methods
  * setTargets
  * @private
  * @param {obj} args - This method act as intermediate to SwitchCase.setTargets
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
  var setTargets = function setTargets(target) {
    self.setTargets(target);
    return this;
  };
  var toCase = function toCase(flag) {
    return function (exprs, vals, fn) {
      self.match(interpret(exprs), vals, fn, flag);
      return this;
    };
  };
  var toAllOther = function toAllOther(vals, fn) {
    self.match(true, vals, fn, "SIMPLE");
    return this;
  };
  var Ended = function Ended(fn) {
    return fn(debug, self.result);
  };

  Object.defineProperty(Interface, "setTargets", {
    value: setTargets,
    writable: false
  });

  Interface.toCase = toCase("SIMPLE");
  Interface.toCaseOR = toCase("OR");
  Interface.toCaseAND = toCase("AND");
  Interface.toAllOther = toAllOther;
  Interface.Ended = Ended;

  return Interface;
}

module.exports = InterfaceClosure;