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

  setMatchingTargets(...targets) { 
    const len = targets.length;
    let temp = {};
    for (let i = 0; i < len; i++) {
      temp = Object.assign(temp, targets[i]);
    }
    const setObjToMap = (map, elem) => map.set(elem[0], elem[1]);
    this.testTargets = Object.entries(temp).reduce(setObjToMap, new Map());
    return this;
  }

  // @ findMatch is the native interface of SwitchCase
  // will need to implement typecheck 
  findMatch(exp, values, fn, flag) {
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [values, fn] = typeof values === "function" ? [null, values] : [values, fn];

    const expr = this._setExpression(exp);
    const methods = {
      OR: "_evaluateOR",
      AND: "_evaluateAND",
      SIMPLE: "_evaluateSingleCase",
    };

    const matching = flag === "SIMPLE" 
      ? this[ methods[flag] ](expr.get(0)) 
      : this[ methods[flag] ](expr);
    
    matching && this._break(values, fn);
    return this;
  }

  otherwise(values, fn) {
    this.findMatch("true", values, fn, "SIMPLE");
    return this;
  }

  end(fn) {
    const debug = () => {
      console.log(this.testTargets);
    }
    return fn(debug, this.result);
  }

  _break(val, fn) {
    this.isMatched = true;
    this.result = typeof fn === "function" ? fn(val) : val;
    return true;
  }

  _setExpression(cases) {
    if (!Array.isArray(cases)) {
      cases = [ cases ];
    }
    
    const expressions = new Map();
    const len = cases.length;
    for (let i = 0; i < len; i++) {
      expressions.set(i, cases[i]);
    }

    return expressions;
  }

  _evaluateAND(expressions) {
    for (let i = 0; i < expressions.size; i++) {
      if (!this._evaluateSingleCase(expressions.get(i))) return false; 
    }
    return true;
  }

  _evaluateOR(expressions) {
    for (let i = 0; i < expressions.size; i++) {
      if (this._evaluateSingleCase(expressions.get(i))) return true;
    }
    return false;
  }

  _evaluateSingleCase(expression) {
    const testTargets = this.testTargets;
    const matchState = this.isMatched;

    return matchState || !testTargets 
      ? false 
      : this._matchingExpression(expression, testTargets);
  }
   /* 
    @filter 
    one-semi-column-only rule should be core
    additional, length check, keyword check should be part of interface
    security, that can be modify by user via json or config object      
  */
  _filter(expression) {
    // /\([^-+*/%]+\)|{.+}|.+;.+/
    return typeof expression === "function" 
      ? false
      : !!expression.match(/[\w]+(?=\(.+\)|\([^-+*%/]+\))|{.+}|.+;.+/);
  }

  _matchingExpression(expression, testTargets) {
    const args = [];
    const values = [];
    const statement = "return " + expression;

    if (this._filter(expression)) throw new Error("expression must be single-statement-only");

    testTargets.forEach((value, key) => {
      args.push(key);
      values.push(value);
    });

    const functionExp = typeof expression === "function" 
      ? expression 
      : new Function(...args, statement);

    return functionExp(...values);
  }
}

export default SwitchCase;