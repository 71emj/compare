// @flow
const Interface = require("./Interface");

function Compare(config: { limit: number, keywords: Array<string> }) {
	"use strict";
	/** @function Factory - initiate a Compare with user input to initiate Interface/SwitchCase
	* @param {object} args - the targets user wish to compare with
	* @param {arg} simpleExp - flag indicating user input is valid for simple expression
	*/
	function Factory(args: {}) {
		if (!args) {
			throw new Error("Argument cannot be empty");
		}
		if (typeof arguments[0] !== "object") {
			throw new TypeError("Variable must be an object, or an array of objects");
		}
		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const simpleExp = Object.keys(args).length === 1;
		const switchCase = Interface(simpleExp, config);
		return switchCase.setTargets(...targets);
	}
	return Factory;
}

module.exports = Compare;
