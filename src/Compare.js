// @flow
"use strict";
const Interface = require("./Interface");
const Router = require("./Router");
const { isType } = require("./util/Helpers");

function Compare(config: {
	limit: number,
	keywords: Array<string>,
	type: string
} = { type: "switch" }) {

	/** @function Factory - initiate a Compare with user input to initiate Interface/SwitchCase
	* @param {object} args - the targets user wish to compare with
	* @param {arg} simpleExp - flag indicating user input is valid for simple expression
	*/
	function Factory(args: {}) {
		if (!args) {
			throw new Error("Argument cannot be empty");
		}
		const targets = isType(args, "array") ? args : Array.from(arguments);
		const isObject = item => isType(item, "object");
		if (!targets.every(isObject)) {
			throw new TypeError("Variable must be an object, or an array of objects");
		}
		const targetBody = targets.reduce((obj, item) => Object.assign(obj, item), {});
		const simpleExp = Object.keys(targetBody).length === 1;

		return {
			"switch": () => {
				const switchCase = Interface(simpleExp, config);
				return switchCase._init(targetBody);
			},
			"router": () => {
				const router = Router(simpleExp, config);
				return router._init(targetBody);
			}
		}[config.type]();
	}

	return Factory;
}

module.exports = Compare;
