var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

export function not(fn) {
  return function () {
    return !fn.apply(undefined, arguments);
  };
}

export function isType(target, type) {
  return type === "array" ? Array.isArray(target) : (typeof target === "undefined" ? "undefined" : _typeof(target)) === type;
}
export var notType = not(isType);

export function makeArray(expr) {
  return isType(expr, "array") ? expr : [expr];
}

export function swap(arg1, arg2) {
  return [arg1, arg2];
}

export function escapeRegExp(expr) {
  return notType(expr, "string") ? expr : expr.replace(/[|\\/{}()[\]^$+*?.]/g, "_");
}

export function matchExp(expr) {
  if (isType(expr, "function") || isType(expr, "boolean")) {
    return false;
  }
  var simplePattern = /^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/;
  return expr.toString().match(simplePattern);
}