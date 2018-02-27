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
    // this setter signal init
    this.targets = targetObj;
    this.isMatched = false;
    this.result = null;
  }

  setMatchingTargets(...targets) { 
    const len = targets.length;
    let temp = {};
    for (let i = 0; i < len; i++) {
      // this.testTargets = Object.assign(temp, targets[i]);
      temp = Object.assign(temp, targets[i]);
    }
    const setObjToMap = (map, elem) => map.set(elem[0], elem[1]);
    this.testTargets = Object.entries(temp).reduce(setObjToMap, new Map());
    return this;
  }

  // @ findMatch is the native interface of SwitchCase
  // might need to implement stricter check for errors (not really if user only use Match's interface)
  findMatch(exp, values, fn, flag) {
    [flag, fn] = arguments.length <= 3 ? [fn, null] : [flag, fn];
    [values, fn] = typeof values === "function" ? [null, values] : [values, fn];

    const cond = this._setConditions(exp);
    const methods = {
      OR: "_evaluateOR",
      AND: "_evaluateAND",
      SIMPLE: "_evaluateSingleCase",
    };

    const matching = flag === "SIMPLE" 
      ? this[ methods[flag] ](cond.get(0)) 
      : this[ methods[flag] ](cond);
    
    matching && this._break(values, fn);
    return this;
  }

  otherwise(values, fn) {
    this.findMatch("true", values, fn, "SIMPLE");
    return this;
  }

  onEnd(fn) {
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

  _setConditions(cases) {
    if (!Array.isArray(cases)) {
      cases = [ cases ];
    }
    const expressions = new Map();
    const len = cases.length;
    for (let i = 0; i < len; i++) {
      expressions.set(i, cases[i]);
    }
    // now cases are set into dictionary
    return expressions;
  }

  _evaluateAND(expressions) {
    for (let i = 0; i < expressions.size; i++) {
      if (!this._evaluateSingleCase(expressions.get(i))) {
        return false;
      }
    }
    return true;
  }

  _evaluateOR(expressions) {
    for (let i = 0; i < expressions.size; i++) {
      if (this._evaluateSingleCase(expressions.get(i))) {
        return true;
      }
    }
    return false;
  }

  _evaluateSingleCase(expression) {
    const testTargets = this.testTargets;
    const matchState = this.isMatched;

    if (matchState || !testTargets) {
      return false;
    }
    // filter here
    return this._matchingExpression(expression, testTargets);
  }

  _filter(expression) {
    // /\([^-+*/%]+\)|{.+}|.+;.+/
    /* 
      @filter 
      one-semi-column-only rule should be core
      additional, length check, keyword check should be part of interface
      security, that can be modify by user via json or config object      
    */
    return ( 
      typeof expression === "function" 
      ? false
      : !!expression.match(/[\w]+(?=\(.+\)|\([^-+*%/]+\))|{.+}|.+;.+/)
    )
  }

  _matchingExpression(expression, testTargets) {
    const args = [];
    const values = [];
    const statement = "return " + expression;

    if (this._filter(expression)) {
      throw new Error("expression must be single-statement-only");
    }

    // Object
    //   .entries(testTargets)
    //   .forEach(elem => {
    //     args.push(elem[0]);
    //     values.push(elem[1]);
    //   });
    
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