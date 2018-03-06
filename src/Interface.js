// @flow
const SwitchCase = require("./SwitchCase");

function InterfaceClosure(simpleExp, config) {
  const self = new SwitchCase();

  const Interface = Object.create({});
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
  const debug = opts => {
    const targets = opts ? self.testTargets[opts] : self.testTargets
    console.log({ targets, cases: self.history });
  }
  const filter = exprs => {
    const pattern = `${rules.keywords.join("|")}|.{${rules.limit},}`;
    const regexp = new RegExp(pattern);
    const testing = elem => !self._type(elem, "function") && regexp.test(elem) ? true : false;
    return !!exprs.filter(testing)[0];
  }
  const verbose = exprs => {
      if (self._type(exprs, "function")) {
        return exprs;
      }
      const name = self.testTargets.args[0];
      const mapping = expr => {
        const simple = expr.toString().match(/^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/);
        return simple && !self._type(expr, "boolean")
          ? `${name} ${simple[2] || (+expr ? "==" : "===")} "${simple[1] || simple[3]}"`
          : expr;
      }; // mathcing in sequence of "value", "operator", "following value"
      return exprs.map(mapping);
  }
  const interpret = expr => {
    const exprs = self._isArray(expr);
    if (filter(exprs)) {
      throw new Error(
        `individual expression must not exceed more than ${rules.limit} characters ` +
        `and must not contain keywords such as ${rules.keywords.join(", ")} etc.`
      );
    }
    return simpleExp ? verbose(exprs) : exprs;
  }


  /** Defining interface methods
  *
  */
  const setTargets = function(arg) {
    self.setTargets(arg);
    return this;
  }
  const toCase = function(flag) {
    return function(exprs, vals, fn) {
      self.match(interpret(exprs), vals, fn, flag);
      return this;
    }
  }
  const toAllOther = function(vals, fn) {
    self.match(true, vals, fn, "SIMPLE");
    return this;
  }
  const Ended = function(fn) {
    return fn(debug, self.result);
  }

  Object.defineProperty(Interface, "setTargets", {
      value: setTargets,
      writable: false
  });

  Interface.toCase = toCase("SIMPLE");
  Interface.toCaseOR = toCase("OR");
  Interface.toCaseAND = toCase("AND");
  Interface.toAllOther = toAllOther;
  Interface.Ended = Ended;

  console.log(Interface);
  return Interface;
}

module.exports = InterfaceClosure;
