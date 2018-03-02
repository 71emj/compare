// @flow

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

  // @ param is the native interface of SwitchCase
  // will need to implement typecheck
  match(exp, values, fn, flag) {
    this._testForError("expression", exp);
    if (this.isMatched) {
      return this;
    }
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [values, fn] = typeof values === "function" ? [null, values] : [values, fn];

    const expr = this._setExpression(exp);
    const matching = flag === "SIMPLE" 
      ? this._evaluateOne(expr.get(0)) 
      : this._evaluateMany(expr, flag);

    matching && this._break(values, fn);
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
    const exprs = this._isArray(expressions);
    const aCase = new Map();
    const len = exprs.length;
    for (let i = 0; i < len; i++) {
      aCase.set(i, exprs[i]);
    }
    return aCase;
  }

  _evaluateMany(expr, flag) {
    const boolSet = {
      "OR": [true, false],
      "AND": [false, true]
    };
    if (!(flag in boolSet)) {
      throw new Error("Requested task is not a valid type in this method");
    }
    for (let i = 0; i < expr.size; i++) {
      if (boolSet[flag][0] ? this._evaluateOne(expr.get(i)) : !this._evaluateOne(expr.get(i))) {
        return boolSet[flag][0];
      }
    }
    return boolSet[flag][1];
  }

  _evaluateOne(expression) {
    const testTargets = this.testTargets;
    return this._matchingExpression(expression, testTargets);
  }

  _matchingExpression(expression, { targets, args, values }) {
    this._testForError("filter", expression);
    const statement = "return " + expression;
    const functionExp = new Function(...args, statement);
    try {
      return typeof expression === "function" ?
        expression(targets) :
        functionExp(...values);
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
      filter: exp => {
        if (typeof exp === "function") { 
          return; 
        }
        if (exp.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) { 
          throw new Error("Expression must be single-statement-only");
        }
      }  
    }[name](val);
  }
}

module.exports = SwitchCase;