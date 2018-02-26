class SwitchCase {

  get testTargets() {
    return this.targets;
  }

  get isMatched() {
    return this.matched;
  }

  set isMatched(boolean) {
    this.matched = boolean;
  }

  set testTargets(targetObj) {
    // this setter signal init
    this.targets = targetObj;
    this.isMatched = false;
    this.result = null;
  }

  setMatchingTargets(...targets) { 
    // the default length guaranteed for loop to be run once, clearing out prev data if exist
    const len = targets.length || 1;
    for (let i = 0, temp = {}; i < len; i++) {
      this.testTargets = Object.assign(temp, targets[i]);
    }
    return this;
  }
  
  // interfaces can be extracted from object, and defined as 
  // wrapper methods
  onMatch(singleExp, values, fn) {
    this._findMatch(singleExp, values, fn, "SIMPLE");
    return this;
  }

  onMatchOR(expressions, values, fn) {
    this._findMatch(expressions, values, fn, "OR");
    return this;
  }

  onMatchAND(expressions, values, fn) {
    this._findMatch(expressions, values, fn, "OR");
    return this;
  }

  otherwise(values, fn) {
    this._findMatch("true", values, fn, "SIMPLE");
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

  _findMatch(exp, values, fn, flag) {
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
    return matching ? this._break(values, fn) : false;
  }

  _setConditions(cases) {
    if (typeof cases === "string") {
      cases = [ cases ];
    }
    const conditions = new Map();
    const len = cases.length;
    for (let i = 0; i < len; i++) {
      conditions.set(i, cases[i]);
    }
    // now cases are set into dictionary
    return conditions;
  }

  _evaluateAND(conditions) {
    for (let i = 0; i < conditions.size; i++) {
      if (!this._evaluateSingleCase(conditions.get(i))) {
        return false;
      }
    }
    return true;
  }

  _evaluateOR(conditions) {
    for (let i = 0; i < conditions.size; i++) {
      if (this._evaluateSingleCase(conditions.get(i))) {
        return true;
      }
    }
    return false;
  }

  _evaluateSingleCase(condition) {
    const testTargets = this.testTargets;
    const matchState = this.isMatched;

    if (matchState || !testTargets) {
      return false;
    }
    // filter here
    return this._matchingExpression(condition, testTargets);
  }

  _matchingExpression(condition, testTargets) {
    const args = [];
    const values = [];
    const expression = "return " + condition;

    Object
      .entries(testTargets)
      .forEach(elem => {
        args.push(elem[0]);
        values.push(elem[1]);
      });

    return new Function(...args, expression)(...values);
  }
}

export default SwitchCase;