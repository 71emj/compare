var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SwitchInterface = require("./Interface");

function Compare(config) {
	"use strict";
	// Match should take in a config object 
	// and return an wrapper function for minimal interface 	
	// @ Wrapper provides interface to utilize full power of the SwitchCase
	// such as interpreting simple expression to more verbose (accepted format of SwitchCase) expression 

	var securityConfig = {
		limit: 50,
		keywords: ["document", "window", "process"]
	};
	var rules = Object.assign(securityConfig, config);

	function Factory(args) {
		var _switchCase$_init;

		if (!args) {
			throw new Error("Argument cannot be empty");
		}
		if (_typeof(arguments[0]) !== "object") {
			throw new TypeError("Variable must be an object, or an array of objects");
		}

		var switchCase = new SwitchInterface();
		var targets = Array.isArray(args) ? args : Array.from(arguments);
		var argIsSimple = Object.keys(args).length === 1;
		return (_switchCase$_init = switchCase._init(argIsSimple, rules)).setTargets.apply(_switchCase$_init, _toConsumableArray(targets));
	}

	return Factory;
}

module.exports = Compare;