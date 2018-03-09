// @flow
"use strict";
const SwitchCase = require("./SwitchCase");
const { Ended, toCase, toAllOther } = require("./util/CommonMethods");
const { notType, makeArray, escapeRegExp, setPrivProp } = require("./util/Helpers");

function RouteController(simpleExp, config) {
  const self = new SwitchCase();
  const Router = {};

  if (!simpleExp) {
    throw new SyntaxError("Router only accept single object/property os argument");
  }

  const interpret = exprs => {
    const name = self.testTargets.args[0];
    const translate = expr => `${name} === "${escapeRegExp(expr)}"`;
    return makeArray(exprs).map(translate);
  };

  const setTargets = function(pathname) {
    const path = Object.entries(pathname)[0][1];
    if (notType(path, "string")) {
      throw new TypeError("Path should be string or array of strings only");
    }
    self.setTargets({ path: escapeRegExp(path) });
    return this;
  };
  setPrivProp(Router, "_init", setTargets);

  Router.toPath = toCase(self, "SIMPLE", interpret);
  Router.toManyPath = toCase(self, "OR", interpret);
  Router.toAllOther = toAllOther(self);
  Router.Ended = Ended(self);

  return Router;
}

module.exports = RouteController;
