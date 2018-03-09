"use strict";

var SwitchCase = require("./SwitchCase");

var _require = require("./util/CommonMethods"),
    Ended = _require.Ended,
    toCase = _require.toCase,
    toAllOther = _require.toAllOther;

var _require2 = require("./util/Helpers"),
    isType = _require2.isType,
    notType = _require2.notType,
    makeArray = _require2.makeArray,
    matchExp = _require2.matchExp,
    setPrivProp = _require2.setPrivProp;

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
    var translate = function translate(expr) {
      var simple = matchExp(expr);
      return !simple ? expr : name + " " + (simple[2] || (+expr ? "==" : "===")) + " \"" + (simple[1] || simple[3]) + "\"";
    };
    return exprs.map(translate);
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
  */
  var setTargets = function setTargets(target) {
    self.setTargets(target);
    return this;
  };
  setPrivProp(Interface, "_init", setTargets);

  Interface.toCase = toCase(self, "SIMPLE", interpret);
  Interface.toCaseOR = toCase(self, "OR", interpret);
  Interface.toCaseAND = toCase(self, "AND", interpret);
  Interface.toAllOther = toAllOther(self);
  Interface.Ended = Ended(self);

  return Interface;
}

module.exports = InterfaceClosure;