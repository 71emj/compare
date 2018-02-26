import SwitchCase from "./Switch";

function Match(config) {
	"use strict";
	// Match should take in a config object 
	// and return an wrapper function for minimal interface 	
	// @ Wrapper provides interface to utilize full power of the SwitchCase
	// such as interpreting simple expression to more verbose (accepted format of SwitchCase) expression 

	function Wrapper(args) {
		if (!args) throw new Error("argument cannot be empty");
		if (typeof arguments[0] !== "object") throw new TypeError("Variable must be an object, or an array of objects");

		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const argIsSimple = Object.keys(args).length === 1;
		
		class SwitchInterface extends SwitchCase {
			// interfaces can be extracted from object, and defined as 
		  // wrapper methods
		  _init(isSimple) {
		  	// passing argIsSimple to watch for single string evaluation
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
		    this.findMatch(expressions, values, fn, "AND");
		    return this;
		  }

		  _interpret(expr) {
				const { simpleExp } = this;
		  	return simpleExp ? this._verbose(expr) : expr;
		  }

		  _verbose(expression) {
		  	if (typeof expression === "function") {
		  		return expression;
		  	} 

		  	if (!Array.isArray(expression)) {
		  		expression = [ expression ];
		  	}

		  	const len = expression.length;
				const name = Object.entries(this.testTargets)[0][0];
				const mapping = expr => {
					const simple = expr.match(/^\b\w+\b$/g); 
					const verbose = `${name} === "${simple}"`;
					return simple ? verbose : expr;
		  	};

		  	const newExp = expression.map(mapping);
		  	return newExp;
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