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
    const len = targets.length;
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
    this._beforeStart(exp);
    if (this.isMatched) {
      return this;
    }
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [values, fn] = typeof values === "function" ? [null, values] : [values, fn];

    const expr = this._setExpression(exp);
    const methods = { SIMPLE: "_evaluateOne" };

    const matching = flag in methods 
      ? this[methods[flag]](expr.get(0))
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
  
  _beforeStart(exp) {
    const expcheck = typeof exp === "string" || typeof exp === "function" || Array.isArray(exp) || false;
    if (!this.testTargets) {
      throw new TypeError("TestTargets cannot be null or undefined");
    }
    if (!expcheck) {
      throw new TypeError("An expression must be a string, array of string, or a function");
    }
    return;
  }
  
  _break(val, fn) {
    this.isMatched = true;
    this.result = typeof fn === "function" ? fn(val) : val;
    return true;
  }

  _setExpression(cases) {
    if (!Array.isArray(cases)) {
      cases = [cases];
    }
    const expressions = new Map();
    const len = cases.length;
    for (let i = 0; i < len; i++) {
      expressions.set(i, cases[i]);
    }
    return expressions;
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
  /* 
    @ param 
    one-semi-column-only rule should be core
    additional, length check, keyword check should be part of interface
    security, that can be modify by user via json or config object      
  */
  _filter(expression) {
    return typeof expression === "function"
      ? false
      : !!expression.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/);
  }

  _matchingExpression(expression, { targets, args, values }) {
    const statement = "return " + expression;
    if (this._filter(expression)) { 
      throw new Error("Expression must be single-statement-only"); 
    }
    const functionExp = new Function(...args, statement);
    
    try { 
      return typeof expression === "function" 
      ? expression(targets)
      : functionExp(...values); 
    } 
    catch(err) { throw err; }
  }
}

module.exports = SwitchCase;