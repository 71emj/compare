// @flow
"use strict";
const SwitchCase = require("./SwitchCase");
const { Ended, toCase } = require("../util/CommonMethods");
const { notType, escapeRegExp } = require("../util/Helpers");

function RouteController(simpleExp, config) {
  const self = new SwitchCase();
  const Router = {};

  if (!simpleExp) {
    throw new SyntaxError("Router only accept single object/property os argument");
  }
  // what router interface does, is
  // filter out non-simple expression, throw error
  //
  const interpret = expr => {
    const name = self.testTargets.args[0];
    return `${name} === "${escapeRegExp(expr)}"`;
  };

  const setTargets = function(pathname) {
    const path = Object.entries(pathname)[0][1];
    if (notType(path, "string")) {
      throw new TypeError("Path should be string only");
    }
    self.setTargets({ path: escapeRegExp(path) });
    return this;
  };

  Router.setTargets = setTargets;
  Router.toPath = toCase(self, "SIMPLE", interpret);
  Router.Ended = Ended(self);

  return Router;
}

module.exports = RouteController;
