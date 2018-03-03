// @flow

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
    [values, fn] = typeof values === "function" ? [null, values] : [values, fn];

    const expr = this._setExpression(exp);
    this._evaluate(expr, flag) && this._break(values, fn);
    return this;
  }

  end(fn) {
    const debug = () => {
      console.log(this.testTargets);
    };
    return fn(debug, this.result);
  }

  _break(val, fn) {
    this.isMatched = true;
    this.result = typeof fn === "function" ? fn(val) : val;
    return true;
  }

  _setExpression(expressions) {
    const setExprToMap = (map, exp, index) => map.set(index, exp);
    return this._isArray(expressions).reduce(setExprToMap, new Map());
  }

  _evaluate(expr, flag) {
    this._testForError("falseFlag", flag);
    return {
      SIMPLE: (exp, targets) => this._matchingExpression(exp.get(0), targets),
      OR: (exprs, targets) => {
        for (let exp of exprs) {
          if (this._matchingExpression(exp[1], targets)) {
            return true;
          }
        }
        return false;
      },
      AND: (exprs, targets) => {
        for (let exp of exprs) {
          if (!this._matchingExpression(exp[1], targets)) {
            return false;
          }
        }
        return true;
      }
    }[flag](expr, this.testTargets);
  }

  _matchingExpression(expression, { targets, args, values }) {
    const isFunction = this._testForError("filter", expression);
    const statement = "return " + expression;
    try {
      return isFunction ? expression(targets) : new Function(...args, statement)(...values);
    } catch (err) { throw err; }
  }

  _isArray(expr) {
    return Array.isArray(expr) ? expr : [ expr ];
  }

  _testForError(name, val) {
    return {
      targets: targets => {
        // because of rest syntax targets is always going to be an array
        if (!targets || typeof targets[0] !== "object") {
          throw new TypeError("TestTargets cannot be null or undefined");
        }
      },
      expression: exp => {
        const expcheck = typeof exp === "string" || typeof exp === "function" || Array.isArray(exp) || false;
        if (!expcheck) {
          throw new TypeError("An expression must be a string, array of string, or a function");
        }
      },
      falseFlag: flag => {
        if (!(flag === "SIMPLE" || flag === "OR" || flag === "AND")) {
          throw new Error("Requested task is not a valid type in this method");
        }
      },
      filter: exp => {
        if (typeof exp === "function") { 
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