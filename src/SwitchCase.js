// @flow
/** @constructor SwitchCase - process all evaluation logics
* setTargets(...targets)
* @param {[objects]} ...targets - bundle indefinite amount of objects into array
* match(expr, vals, fn, flag)
* @param {string || array || function} expr - matching expression
* @param {any} vals - the data user wish to receive on matched case
* @param {function} fn - an optionale callback
* @param {string} flag - which type of matching user wish to perform
*/
class SwitchCase {
  get testTargets() {
    return this.targets;
  }

  get history() {
    return this.record;
  }

  set history(entry) {
    this.record = entry;
  }

  set testTargets(targetObj) {
    this.targets = targetObj;
    this.history = [];
    this.matched = false;
    this.result = null;
  }

  setTargets(target) {
    this._filter("bad targets", target);

    const collection = { targets: target, args: [], vals: [] };
    const setObjToMap = (collection, elem) => {
      collection.args.push(elem[0]);
      collection.vals.push(elem[1]);
      return collection;
    }
    this.testTargets = Object.entries(target).reduce(setObjToMap, collection);
    return this;
  }

  match(exprs, vals, fn, flag) {
    this._filter("bad expression", exprs);

    if (this.matched) {
      return this;
    }
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [vals, fn] = this._type(vals, "function") ? [null, vals] : [vals, fn];
    this._evaluate(this._setClaim(exprs), flag) && this._break(vals, fn);
    return this;
  }

  end(fn) {
    const debug = () => console.log(this.record);
    return fn(debug, this.result);
  }

  _break(val, fn) {
    this.result = this._type(fn, "function") ? fn(val) : val;
    return this.matched = true;
  }

  _setClaim(exprs) {
    const expToMap = (map, expr, index) => map.set(index, expr);
    return this._isArray(exprs).reduce(expToMap, new Map());
  }

  _evaluate(claim, flag) {
    this._filter("bad flag", flag);

    const entry = new Map();
    const pushTo = (name, expr) => name.push(
      this._type(expr, "function") ? "[Function]" : expr
    );
    const outline = (claim, targets, pass = [], fail = []) => {
      claim.forEach(expr => this._matchExp(expr, targets) ? pushTo(pass, expr) : pushTo(fail, expr));
      fail.length && entry.set("fail", fail.join(" | "));
      pass.length && entry.set("pass", pass.join(" | "));
      return this.history.push(entry) && entry;
    }
    return {
      SIMPLE: (claim, targets) => outline([ claim.get(0) ], targets).has("pass") ? true : false,
      OR: (claim, targets) => outline(claim, targets).has("pass") ? true : false,
      AND: (claim, targets) => outline(claim, targets).has("fail") ? false : true
    }[flag](claim, this.testTargets);
  }

  _matchExp(expr, { targets, args, vals }) {
    try {
      const isFunction = this._filter("bad syntax", expr);
      const statement = "return " + expr;
      return isFunction ? expr(targets) : new Function(...args, statement)(...vals);
    } catch (err) {
      throw err;
    }
  }

  _isArray(claim) {
    return this._type(claim, "array") ? claim : [ claim ];
  }

  _type(target, type) {
    return type === "array" ? Array.isArray(target) : typeof target === type;
  }

  _filter(name, val) {
    return {
      "bad targets": target => {
        if (!target || !this._type(target, "object")) {
          throw new TypeError("TestTargets cannot be null or undefined");
        }
      },
      "bad expression": exprs => {
        const check = elem => this._type(exprs, elem);
        if (!["boolean", "string", "function", "array"].filter(check)[0]) {
          throw new TypeError("An expression must be a string, array of string, or a function");
        }
      },
      "bad flag": flag => {
        if (!(flag === "SIMPLE" || flag === "OR" || flag === "AND")) {
          throw new Error("Requested task is not a valid type in this method");
        }
      },
      "bad syntax": expr => {
        if (this._type(expr, "function")) {
          return true;
        }
        if (this._type(expr, "boolean")) {
          return false;
        }
        if (expr.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) {
          throw new Error("Expression must be single-statement-only");
        }
      }
    }[name](val);
  }
}

module.exports = SwitchCase;
