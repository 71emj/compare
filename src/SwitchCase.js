// @flow

/** Class SwitchCase handles underlying functions
* Compare.setTargets(...targets)
* @param {[objects]} ...targets - bundle indefinite amount of objects into array
*
* Compare.match(expr, vals, fn, flag)
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

  set history(value) {
    this.record = value;
  }

  set testTargets(targetObj) {
    this.targets = targetObj;
    this.history = [];
    this.matched = false;
    this.result = null;
  }

  setTargets(...targets) {
    this._filter("bad targets", targets);
    const collection = { targets: {}, args: [], vals: [] };

    const setArrToObj = (obj, item) => Object.assign(obj, item);
    const setObjToMap = (collection, elem) => {
      collection.args.push(elem[0]);
      collection.vals.push(elem[1]);
      return collection;
    };

    collection.targets = targets.reduce(setArrToObj, {});
    this.testTargets = Object.entries(collection.targets).reduce(setObjToMap, collection);
    return this;
  }

  match(expr, vals, fn, flag) {
    this._filter("bad expression", expr);
    if (this.matched) {
      return this;
    }
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [vals, fn] = this._type(vals, "function") ? [null, vals] : [vals, fn];

    const exprs = this._setExpression(expr);
    this._evaluate(exprs, flag) && this._break(vals, fn);
    return this;
  }

  end(fn) {
    const debug = () => console.log(this.record);
    return fn(debug, this.result);
  }

  _break(val, fn) {
    this.matched = true;
    this.result = this._type(fn, "function") ? fn(val) : val;
    return true;
  }

  _setExpression(exprs) {
    const exptoMap = (map, expr, index) => map.set(index, expr);
    return this._isArray(exprs).reduce(exptoMap, new Map());
  }

  _evaluate(expr, flag) {
    this._filter("bad flag", flag);
    const entry = new Map();

    const pushTo = (name, expr) => name.push(this._type(expr, "function") ? "[Function]" : expr);
    const outline = (exprs, targets, pass = [], fail = []) => {
      exprs.forEach(expr => this._matchExp(expr, targets) ? pushTo(pass, expr) : pushTo(fail, expr));
      fail.length && entry.set("fail", fail.join(" | "));
      pass.length && entry.set("pass", pass.join(" | "));
      return this.history.push(entry) && entry;
    }
    return {
      SIMPLE: (expr, targets) => outline([ expr.get(0) ], targets).has("pass") ? true : false,
      OR: (exprs, targets) => outline(exprs, targets).has("pass") ? true : false,
      AND: (exprs, targets) => outline(exprs, targets).has("fail") ? false : true
    }[flag](expr, this.testTargets);
  }

  _matchExp(expr, { targets, args, vals }) {
    const isFunction = this._filter("bad syntax", expr);
    const statement = "return " + expr;
    try {
      return isFunction ? expr(targets) : new Function(...args, statement)(...vals);
    } catch (err) { throw err; }
  }

  _isArray(expr) {
    return this._type(expr, "array") ? expr : [ expr ];
  }

  _type(expr, type) {
    return type === "array" ? Array.isArray(expr) : typeof expr === type;
  }

  _filter(name, val) {
    return {
      "bad targets": targets => {
        if (!targets || !this._type(targets[0], "object")) {
          throw new TypeError("TestTargets cannot be null or undefined");
        }
      },
      "bad expression": expr => {
        const check = elem => this._type(expr, elem);
        if (!(["string", "function", "array"].filter(check))) {
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
        if (expr.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) {
          throw new Error("Expression must be single-statement-only");
        }
      }
    }[name](val);
  }
}

module.exports = SwitchCase;
