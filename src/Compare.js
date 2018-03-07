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
		const targets = Array.isArray(args) ? args : Array.from(arguments);
		const isObject = item => typeof item === "object";
		if (!targets.every(isObject)) {
			throw new TypeError("Variable must be an object, or an array of objects");
		}
		const targetBody = targets.reduce((obj, item) => Object.assign(obj, item), {});
		const simpleExp = Object.keys(targetBody).length === 1;
		const switchCase = Interface(simpleExp, config);
		return switchCase.setTargets(targetBody);
	}
	return Factory;
}

module.exports = Compare;
