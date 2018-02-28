const SwitchCase = require("./SwitchCase");

function Compare(config) {
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
		if (!args) { 
			throw new Error("argument cannot be empty");
		}
		if (typeof arguments[0] !== "object") { 
			throw new TypeError("Variable must be an object, or an array of objects"); 
		}
		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const argIsSimple = Object.keys(args).length === 1;
		
		class SwitchInterface extends SwitchCase {
			// interfaces can be extracted from object, and defined as 
		  // wrapper methods
		  _init(isSimple) {
		  	this.simpleExp = true;
		  	return this;
		  }

		  toCase(singleExp, values, fn) {
		    this.match(this._interpret(singleExp), values, fn, "SIMPLE");
		    return this;
		  }

		  toCaseOR(exprs, values, fn) {
		    this.match(this._interpret(exprs), values, fn, "OR");
		    return this;
		  }

		  toCaseAND(exprs, values, fn) {
		    this.match(this._interpret(exprs), values, fn, "AND");
		    return this;
		  }

		  toAllOther(values, fn) {
		    this.match("true", values, fn, "SIMPLE");
				return this;
		  }

		  Ended(fn) {
    		const debug = options => {
    			const targets = this.testTargets;
    			console.log(options ? targets[options] : targets);
    		}
    		return fn(debug, this.result);
  		}

		  _interpret(exprs) {
		  	if (this._screen(exprs)) { 
		  		throw new Error(
		  			`individual expression must not exceed more than ${rules.limit} characters ` 
		  			+ `and must not contain keywords such as ${rules.keywords.join(", ")} etc.`
		  		);
		  	}
		  	return this.simpleExp ? this._verbose(exprs) : exprs;
		  }

		  _screen(exprs) {
		  	if (!Array.isArray(exprs)) {
		  		exprs = [ exprs ];
		  	}
		  	const len = exprs.length;
		  	const pattern = `${rules.keywords.join("|")}|.{${rules.limit},}`;
		  	const regexp = new RegExp(pattern);
		  	for (let i = 0; i < len; i++) {
		  		if (typeof exprs[i] === "function") { 
		  			continue; 
		  		}
		  		if (regexp.test(exprs[i])) { 
		  			return true; 
		  		}
		  	}
		  	return false;
		  }

		  _verbose(exprs) {
		  	if (typeof exprs === "function") { 
		  		return exprs;
		  	}

		  	if (!Array.isArray(exprs)) {
		  		exprs = [ exprs ];
		  	}

				// const name = this.testTargets.entries().next(0).value[0];
				const name = this.testTargets.args[0];
				// mathcing "value", "operator", "followed value"
				const mapping = expression => {
					const simple = expression.toString().match(/^\b([\w]+)\b$|^([><=]={0,2})([\s.\d]+)$/); 
					return simple ? `${name} ${simple[2] || "==="} "${simple[1] || simple[3]}"` : expression;
		  	};

		  	return exprs.map(mapping);
		  }
		}

		const switchCase = new SwitchInterface();
		return (
			switchCase
				._init(argIsSimple)
				.setTargets(...targets)
		);
	}

	return Wrapper;
}

module.exports = Compare;