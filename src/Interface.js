// @flow
"use strict";
const SwitchCase = require("./SwitchCase");
const { Ended, toCase } = require("../util/CommonMethods");
const { isType, notType, makeArray, matchExp } = require("../util/Helpers");

function InterfaceClosure(simpleExp, config) {
  const self = new SwitchCase();
  const Interface = {};

  const securityConfig = {
    limit: 50,
    keywords: ["document", "window", "process"]
  };
  const rules = Object.assign(securityConfig, config);

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
  const filter = exprs => {
    const pattern = `${rules.keywords.join("|")}|.{${rules.limit},}`;
    const regexp = new RegExp(pattern);
    const testing = elem => notType(elem, "function") && regexp.test(elem) ? true : false;
    return !!exprs.filter(testing)[0];
  }
  const verbose = exprs => {
    if (isType(exprs, "function")) {
      return exprs;
    }
    const name = self.testTargets.args[0];
    const mapping = expr => {
      const simple = matchExp(expr);
      return !simple ? expr
        : `${name} ${simple[2] || (+expr ? "==" : "===")} "${simple[1] || simple[3]}"`;
    }
    return exprs.map(mapping);
  }
  const interpret = expr => {
    const exprs = makeArray(expr);
    if (filter(exprs)) {
      throw new Error(
        `individual expression must not exceed more than ${rules.limit} characters ` +
        `and must not contain keywords such as ${rules.keywords.join(", ")} etc.`
      );
    }
    return simpleExp ? verbose(exprs) : exprs;
  }

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

  const setTargets = function(target) {
    self.setTargets(target);
    return this;
  }
  const toAllOther = function(vals, fn) {
    self.match(true, vals, fn, "SIMPLE");
    return this;
  }

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
