"use strict";

var Interface = require("./Interface");
var Router = require("./Router");

var _require = require("./util/Helpers"),
    isType = _require.isType;

function Compare() {
	var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { type: "switch" };


	/** @function Factory - initiate a Compare with user input to initiate Interface/SwitchCase
 * @param {object} args - the targets user wish to compare with
 * @param {arg} simpleExp - flag indicating user input is valid for simple expression
 */
	function Factory(args) {
		if (!args) {
			throw new Error("Argument cannot be empty");
		}
		var targets = isType(args, "array") ? args : Array.from(arguments);
		var isObject = function isObject(item) {
			return isType(item, "object");
		};
		if (!targets.every(isObject)) {
			throw new TypeError("Variable must be an object, or an array of objects");
		}
		var targetBody = targets.reduce(function (obj, item) {
			return Object.assign(obj, item);
		}, {});
		var simpleExp = Object.keys(targetBody).length === 1;

		return {
			"switch": function _switch() {
				var switchCase = Interface(simpleExp, config);
				return switchCase._init(targetBody);
			},
			"router": function router() {
				var router = Router(simpleExp, config);
				return router._init(targetBody);
			}
		}[config.type]();
	}

	return Factory;
}

module.exports = Compare;