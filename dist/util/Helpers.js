"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.not = not;
exports.isType = isType;
exports.makeArray = makeArray;
exports.swap = swap;
exports.escapeRegExp = escapeRegExp;
exports.matchExp = matchExp;
exports.setPrivProp = setPrivProp;
function not(fn) {
  return function () {
    return !fn.apply(undefined, arguments);
  };
}

function isType(target, type) {
  return type === "array" ? Array.isArray(target) : (typeof target === "undefined" ? "undefined" : _typeof(target)) === type;
}
var notType = exports.notType = not(isType);

function makeArray(expr) {
  return isType(expr, "array") ? expr : [expr];
}

function swap(arg1, arg2) {
  return [arg1, arg2];
}

function escapeRegExp(expr) {
  return notType(expr, "string") ? expr : expr.replace(/[|\\/{}()[\]^$+*?.]/g, "_");
}

function matchExp(expr) {
  if (isType(expr, "function") || isType(expr, "boolean")) {
    return false;
  }
  var simplePattern = /^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/;
  return expr.toString().match(simplePattern);
}

function setPrivProp(obj, name, prop) {
  return Object.defineProperty(obj, name, {
    value: prop,
    writable: false
  });
}