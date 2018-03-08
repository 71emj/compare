var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Interface = require("./Interface");

function Compare(config) {
	"use strict";
	/** @function Factory - initiate a Compare with user input to initiate Interface/SwitchCase
 * @param {object} args - the targets user wish to compare with
 * @param {arg} simpleExp - flag indicating user input is valid for simple expression
 */

	function Factory(args) {
		if (!args) {
			throw new Error("Argument cannot be empty");
		}
		var targets = Array.isArray(args) ? args : Array.from(arguments);
		var isObject = function isObject(item) {
			return (typeof item === "undefined" ? "undefined" : _typeof(item)) === "object";
		};
		if (!targets.every(isObject)) {
			throw new TypeError("Variable must be an object, or an array of objects");
		}
		var targetBody = targets.reduce(function (obj, item) {
			return Object.assign(obj, item);
		}, {});
		var simpleExp = Object.keys(targetBody).length === 1;
		var switchCase = Interface(simpleExp, config);
		return switchCase.setTargets(targetBody);
	}
	return Factory;
}

module.exports = Compare;