import SwitchCase from "./Switch";

function Match(config) {
	"use strict";
	// Match should take in a config object 
	// and return an wrapper function for minimal interface 	
	// @ SwitchCase.onMatch? should be a part of the wrapper

	function Wrapper(args) {
		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const switchCase = new SwitchCase();
		return switchCase.setMatchingTargets(...targets);
	}

	return Wrapper;
}

export default Match;