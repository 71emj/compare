// @flow
"use strict";
const SwitchCase = require("./SwitchCase");
const { Ended, toCase, toAllOther } = require("./util/CommonMethods");
const { isType, notType, makeArray, matchExp, setPrivProp } = require("./util/Helpers");

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
    const translate = expr => {
      const simple = matchExp(expr);
      return !simple ? expr
        : `${name} ${simple[2] || (+expr ? "==" : "===")} "${simple[1] || simple[3]}"`;
    }
    return exprs.map(translate);
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
  */
  const setTargets = function(target) {
    self.setTargets(target);
    return this;
  }
  setPrivProp(Interface, "_init", setTargets);

  Interface.toCase = toCase(self, "SIMPLE", interpret);
  Interface.toCaseOR = toCase(self, "OR", interpret);
  Interface.toCaseAND = toCase(self, "AND", interpret);
  Interface.toAllOther = toAllOther(self);
  Interface.Ended = Ended(self);

  return Interface;
}

module.exports = InterfaceClosure;
