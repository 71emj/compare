//      
const SwitchCase = require("./SwitchCase");

class SwitchInterface extends SwitchCase {
  _init(isSimple, rules) {
    this.rules = rules;
    this.simpleExp = isSimple;
    return this;
  }

  toCase(exprs, vals, fn) {
  	this.match(this._interpret(exprs), vals, fn, "SIMPLE");
    return this;
  }

  toCaseOR(exprs, vals, fn) {
  	this.match(this._interpret(exprs), vals, fn, "OR");
  	return this;
  }

  toCaseAND(exprs, vals, fn) {
    this.match(this._interpret(exprs), vals, fn, "AND");
    return this;
  }

  toAllOther(vals, fn) {
    this.match(true, vals, fn, "SIMPLE");
    return this;
  }

  Ended(fn) {
    const debug = opts => {
      const targets = opts ? this.testTargets[opts] : this.testTargets
      console.log({ targets, cases: this.history });
    }
    return fn(debug, this.result);
  }

  _interpret(expr) {
  	const exprs = this._isArray(expr);
    if (this._screen(exprs)) {
      throw new Error(
        `individual expression must not exceed more than ${this.rules.limit} characters ` +
        `and must not contain keywords such as ${this.rules.keywords.join(", ")} etc.`
      );
    }
    return this.simpleExp ? this._verbose(exprs) : exprs;
  }

  _screen(exprs) {
    const pattern = `${this.rules.keywords.join("|")}|.{${this.rules.limit},}`;
    const regexp = new RegExp(pattern);

    for (let i = 0, len = exprs.length; i < len; i++) {
      if (this._type(exprs[i], "function")) {
        continue;
      }
      if (regexp.test(exprs[i])) {
        return true;
      }
    }
    return false;
  }

  _verbose(exprs) {
    if (this._type(exprs, "function")) {
      return exprs;
    }
    const name = this.testTargets.args[0];
    const mapping = expr => {
      const simple = expr.toString().match(/^\b([\w]+)\b$|^(!{0,1}[><=]={0,2})([\s.\w]+)$/);
      return simple && !this._type(expr, "boolean")
        ? `${name} ${simple[2] || (+expr ? "==" : "===")} "${simple[1] || simple[3]}"`
        : expr;
    }; // mathcing in sequence of "value", "operator", "following value"
    return exprs.map(mapping);
  }
}

module.exports = SwitchInterface;
