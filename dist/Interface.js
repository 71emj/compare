"use strict";

var SwitchCase = require("./SwitchCase");

var _require = require("./util/CommonMethods"),
    Ended = _require.Ended,
    toCase = _require.toCase;

var _require2 = require("./util/Helpers"),
    isType = _require2.isType,
    notType = _require2.notType,
    makeArray = _require2.makeArray,
    matchExp = _require2.matchExp;

function InterfaceClosure(simpleExp, config) {
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
  var filter = function filter(exprs) {
    var pattern = rules.keywords.join("|") + "|.{" + rules.limit + ",}";
    var regexp = new RegExp(pattern);
    var testing = function testing(elem) {
      return notType(elem, "function") && regexp.test(elem) ? true : false;
    };
    return !!exprs.filter(testing)[0];
  };
  var verbose = function verbose(exprs) {
    if (isType(exprs, "function")) {
      return exprs;
    }
    var name = self.testTargets.args[0];
    var mapping = function mapping(expr) {
      var simple = matchExp(expr);
      return !simple ? expr : name + " " + (simple[2] || (+expr ? "==" : "===")) + " \"" + (simple[1] || simple[3]) + "\"";
    };
    return exprs.map(mapping);
  };
  var interpret = function interpret(expr) {
    var exprs = makeArray(expr);
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
  var toAllOther = function toAllOther(vals, fn) {
    self.match(true, vals, fn, "SIMPLE");
    return this;
  };

  Object.defineProperty(Interface, "setTargets", {
    value: setTargets,
    writable: false
  });

  Interface.toCase = toCase(self, "SIMPLE", interpret);
  Interface.toCaseOR = toCase(self, "OR", interpret);
  Interface.toCaseAND = toCase(self, "AND", interpret);
  Interface.toAllOther = toAllOther;
  Interface.Ended = Ended(self);

  return Interface;
}

module.exports = InterfaceClosure;