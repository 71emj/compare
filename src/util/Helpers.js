export function not(fn) {
  return (...args) => !fn(...args);
}

export function isType(target, type) {
  return type === "array" ? Array.isArray(target) : typeof target === type;
}
export const notType = not(isType);

export function makeArray(expr) {
  return isType(expr, "array") ? expr : [ expr ];
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
  const simplePattern = /^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/;
  return expr.toString().match(simplePattern);
}
