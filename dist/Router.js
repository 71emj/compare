"use strict";

var SwitchCase = require("./SwitchCase");

var _require = require("./util/CommonMethods"),
    Ended = _require.Ended,
    toCase = _require.toCase;

var _require2 = require("./util/Helpers"),
    notType = _require2.notType,
    escapeRegExp = _require2.escapeRegExp;

function RouteController(simpleExp, config) {
  var self = new SwitchCase();
  var Router = {};

  if (!simpleExp) {
    throw new SyntaxError("Router only accept single object/property os argument");
  }
  // what router interface does, is
  // filter out non-simple expression, throw error
  //
  var interpret = function interpret(expr) {
    var name = self.testTargets.args[0];
    return name + " === \"" + escapeRegExp(expr) + "\"";
  };

  var setTargets = function setTargets(pathname) {
    var path = Object.entries(pathname)[0][1];
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