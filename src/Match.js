import SwitchCase from "./Switch";

function Match(config) {
	"use strict";
	// Match should take in a config object 
	// and return an wrapper function for minimal interface 	
	// @ Wrapper provides interface to utilize full power of the SwitchCase
	// such as interpreting simple expression to more verbose (accepted format of SwitchCase) expression 

	const securityConfig = {
		limit: 50,
		keywords: ["document", "window", "process"]
	};
	const rules = Object.assign(securityConfig, config);

	function Wrapper(args) {
		if (!args) throw new Error("argument cannot be empty");
		if (typeof arguments[0] !== "object") throw new TypeError("Variable must be an object, or an array of objects");

		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const argIsSimple = Object.keys(args).length === 1;
		
		class SwitchInterface extends SwitchCase {
			// interfaces can be extracted from object, and defined as 
		  // wrapper methods
		  _init(isSimple) {
		  	this.simpleExp = true;
		  	return this;
		  }

		  onMatch(singleExp, values, fn) {
		    this.findMatch(this._interpret(singleExp), values, fn, "SIMPLE");
		    return this;
		  }

		  onMatchOR(expressions, values, fn) {
		    this.findMatch(this._interpret(expressions), values, fn, "OR");
		    return this;
		  }

		  onMatchAND(expressions, values, fn) {
		    this.findMatch(this._interpret(expressions), values, fn, "AND");
		    return this;
		  }

		  _interpret(expr) {
				const { simpleExp } = this;
		  	return simpleExp ? this._verbose(expr) : expr;
		  }

		  _screen(expressions) {
		  	const len = expressions.length;
		  	const pattern = `${rules.keywords.join("|")}|.{${rules.limit},}`;
		  	const regexp = new RegExp(pattern);
		  	for (let i = 0; i < len; i++) {
		  		if (typeof expressions[i] === "function") continue;
		  		if (regexp.test(expressions[i])) return true;
		  	}
		  	return false;
		  }

		  _verbose(expressions) {
		  	if (typeof expressions === "function") return expressions; 

		  	if (!Array.isArray(expressions)) {
		  		expressions = [ expressions ];
		  	}

		  	if (this._screen(expressions)) throw new Error(
		  			`individual expression must not exceed more than ${rules.limit} characters ` + 
		  			`and must not contain keywords such as ${rules.keywords.join(", ")} etc.`
		  	);

				const name = this.testTargets.entries().next(0).value[0];
				const mapping = expr => {
					const simple = expr.toString().match(/^\b\w+\b$/); 
					return simple ? `${name} === "${simple}"` : expr;
		  	};

		  	return expressions.map(mapping);
		  }
		}

		const switchCase = new SwitchInterface();
		return (
			switchCase
				._init(argIsSimple)
				.setMatchingTargets(...targets)
		);
	}

	return Wrapper;
}

export default Match;