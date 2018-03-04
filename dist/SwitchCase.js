//      

/** Class SwitchCase handles underlying functions
* Compare.setTargets(...targets)
* @param {[objects]} ...targets - bundle indefinite amount of objects into array
*
* Compare.match(exp, values, fn, flag)
* @param {string || array || function} exp - matching expression
* @param {any} values - the data user wish to receive on matched case
* @param {function} fn - an optionale callback
* @param {string} flag - which type of matching user wish to perform
*/
class SwitchCase {
  get testTargets() {
    return this.targets;
  }

  get isMatched() {
    return this.matched;
  }

  set isMatched(bool) {
    this.matched = bool;
  }

  set testTargets(targetObj) {
    this.targets = targetObj;
    this.record = [];
    this.isMatched = false;
    this.result = null;
  }

  setTargets(...targets) {
    this._testForError("targets", targets);
    const collection = { targets: {}, args: [], values: [] };

    const setArrToObj = (obj, item) => Object.assign(obj, item);
    const setObjToMap = (collection, elem) => {
      collection.args.push(elem[0]);
      collection.values.push(elem[1]);
      return collection;
    };

    collection.targets = targets.reduce(setArrToObj, {});
    this.testTargets = Object.entries(collection.targets).reduce(setObjToMap, collection);
    return this;
  }

  match(exp, values, fn, flag) {
    this._testForError("expression", exp);
    if (this.isMatched) {
      return this;
    }
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [values, fn] = this._type(values, "function") ? [null, values] : [values, fn];

    const expr = this._setExpression(exp);
    this._evaluate(expr, flag) && this._break(values, fn);
    return this;
  }

  end(fn) {
    const debug = () => {
      console.log(this.record);
    };
    return fn(debug, this.result);
  }

  _break(val, fn) {
    this.isMatched = true;
    this.result = this._type(fn, "function") ? fn(val) : val;
    return true;
  }

  _setExpression(expressions) {
    const setExprToMap = (map, exp, index) => map.set(index, exp);
    return this._isArray(expressions).reduce(setExprToMap, new Map());
  }

  _evaluate(expr, flag) {
    this._testForError("invalid flag", flag);
    const record = new Map();
    const log = (exprs, targets, pass = [], fail = []) => {
      exprs.forEach(exp => this._matchingExpression(exp, targets)
        ? pass.push(this._type(exp, "function") ? "[Function]" : exp)
        : fail.push(this._type(exp, "function") ? "[Function]" : exp));
      fail.length && record.set("fail", fail.join(" | "));
      pass.length && record.set("pass", pass.join(" | "));
      return this.record.push(record) && record;
    }

    return {
      SIMPLE: (exp, targets) => log(exp, targets).has("pass") ? true : false,
      OR: (exprs, targets) => log(exprs, targets).has("pass") ? true : false,
      AND: (exprs, targets) => log(exprs, targets).has("fail") ? false : true
    }[flag](expr, this.testTargets);
  }

  _matchingExpression(expression, { targets, args, values }) {
    const isFunction = this._testForError("invalid syntax", expression);
    const statement = "return " + expression;
    try {
      return isFunction ? expression(targets) : new Function(...args, statement)(...values);
    } catch (err) { throw err; }
  }

  _isArray(expr) {
    return this._type(expr, "array") ? expr : [ expr ];
  }

  _type(exp, type) {
    return type === "array" ? Array.isArray(exp) : typeof exp === type;
  }

  _testForError(name, val) {
    return {
      targets: targets => {
        if (!targets || !this._type(targets[0], "object")) {
          throw new TypeError("TestTargets cannot be null or undefined");
        }
      },
      expression: exp => {
        const expcheck = this._type(exp, "string") || this._type(exp, "function") || this._type(exp, "array");
        if (!expcheck) {
          throw new TypeError("An expression must be a string, array of string, or a function");
        }
      },
      "invalid flag": flag => {
        if (!(flag === "SIMPLE" || flag === "OR" || flag === "AND")) {
          throw new Error("Requested task is not a valid type in this method");
        }
      },
      "invalid syntax": exp => {
        if (this._type(exp, "function")) {
          return true;
        }
        if (exp.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) {
          throw new Error("Expression must be single-statement-only");
        }
      }
    }[name](val);
  }
}

module.exports = SwitchCase;
