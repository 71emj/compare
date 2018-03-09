"use strict";

var SwitchCase = require("./SwitchCase");

var _require = require("./util/CommonMethods"),
    Ended = _require.Ended,
    toCase = _require.toCase,
    toAllOther = _require.toAllOther;

var _require2 = require("./util/Helpers"),
    notType = _require2.notType,
    makeArray = _require2.makeArray,
    escapeRegExp = _require2.escapeRegExp,
    setPrivProp = _require2.setPrivProp;

function RouteController(simpleExp, config) {
  var self = new SwitchCase();
  var Router = {};

  if (!simpleExp) {
    throw new SyntaxError("Router only accept single object/property os argument");
  }

  var interpret = function interpret(exprs) {
    var name = self.testTargets.args[0];
    var translate = function translate(expr) {
      return name + " === \"" + escapeRegExp(expr) + "\"";
    };
    return makeArray(exprs).map(translate);
  };

  var setTargets = function setTargets(pathname) {
    var path = Object.entries(pathname)[0][1];
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