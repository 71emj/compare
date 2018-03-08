var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @constructor SwitchCase - process all evaluation logics
* setTargets(...targets)
* @param {[objects]} ...targets - bundle indefinite amount of objects into array
* match(expr, vals, fn, flag)
* @param {string || array || function} expr - matching expression
* @param {any} vals - the data user wish to receive on matched case
* @param {function} fn - an optionale callback
* @param {string} flag - which type of matching user wish to perform
*/
var SwitchCase = function () {
  function SwitchCase() {
    _classCallCheck(this, SwitchCase);
  }

  _createClass(SwitchCase, [{
    key: "setTargets",
    value: function setTargets(target) {
      this._filter("bad targets", target);

      var collection = { targets: target, args: [], vals: [] };
      var setObjToMap = function setObjToMap(collection, elem) {
        collection.args.push(elem[0]);
        collection.vals.push(elem[1]);
        return collection;
      };
      this.testTargets = Object.entries(target).reduce(setObjToMap, collection);
      return this;
    }
  }, {
    key: "match",
    value: function match(exprs, vals, fn, flag) {
      this._filter("bad expression", exprs);

      if (this.matched) {
        return this;
      }

      var _ref = arguments.length <= 3 ? [fn, null] : [flag, fn];

      var _ref2 = _slicedToArray(_ref, 2);

      flag = _ref2[0];
      fn = _ref2[1];

      var _ref3 = this._type(vals, "function") ? [null, vals] : [vals, fn];

      var _ref4 = _slicedToArray(_ref3, 2);

      vals = _ref4[0];
      fn = _ref4[1];

      this._evaluate(this._setClaim(exprs), flag) && this._break(vals, fn);
      return this;
    }
  }, {
    key: "end",
    value: function end(fn) {
      var _this = this;

      var debug = function debug() {
        return console.log(_this.record);
      };
      return fn(debug, this.result);
    }
  }, {
    key: "_break",
    value: function _break(val, fn) {
      this.result = this._type(fn, "function") ? fn(val) : val;
      return this.matched = true;
    }
  }, {
    key: "_setClaim",
    value: function _setClaim(exprs) {
      var expToMap = function expToMap(map, expr, index) {
        return map.set(index, expr);
      };
      return this._isArray(exprs).reduce(expToMap, new Map());
    }
  }, {
    key: "_evaluate",
    value: function _evaluate(claim, flag) {
      var _this2 = this;

      this._filter("bad flag", flag);

      var entry = new Map();
      var pushTo = function pushTo(name, expr) {
        return name.push(_this2._type(expr, "function") ? "[Function]" : expr);
      };
      var outline = function outline(claim, targets) {
        var pass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var fail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

        claim.forEach(function (expr) {
          return _this2._matchExp(expr, targets) ? pushTo(pass, expr) : pushTo(fail, expr);
        });
        fail.length && entry.set("fail", fail.join(" | "));
        pass.length && entry.set("pass", pass.join(" | "));
        return _this2.history.push(entry) && entry;
      };
      return {
        SIMPLE: function SIMPLE(claim, targets) {
          return outline([claim.get(0)], targets).has("pass") ? true : false;
        },
        OR: function OR(claim, targets) {
          return outline(claim, targets).has("pass") ? true : false;
        },
        AND: function AND(claim, targets) {
          return outline(claim, targets).has("fail") ? false : true;
        }
      }[flag](claim, this.testTargets);
    }
  }, {
    key: "_matchExp",
    value: function _matchExp(expr, _ref5) {
      var targets = _ref5.targets,
          args = _ref5.args,
          vals = _ref5.vals;

      try {
        var isFunction = this._filter("bad syntax", expr);
        var statement = "return " + expr;
        return isFunction ? expr(targets) : new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(args), [statement])))().apply(undefined, _toConsumableArray(vals));
      } catch (err) {
        throw err;
      }
    }
  }, {
    key: "_isArray",
    value: function _isArray(claim) {
      return this._type(claim, "array") ? claim : [claim];
    }
  }, {
    key: "_type",
    value: function _type(target, type) {
      return type === "array" ? Array.isArray(target) : (typeof target === "undefined" ? "undefined" : _typeof(target)) === type;
    }
  }, {
    key: "_filter",
    value: function _filter(name, val) {
      var _this3 = this;

      return {
        "bad targets": function badTargets(target) {
          if (!target || !_this3._type(target, "object")) {
            throw new TypeError("TestTargets cannot be null or undefined");
          }
        },
        "bad expression": function badExpression(exprs) {
          var check = function check(elem) {
            return _this3._type(exprs, elem);
          };
          if (!["boolean", "string", "function", "array"].filter(check)[0]) {
            throw new TypeError("An expression must be a string, array of string, or a function");
          }
        },
        "bad flag": function badFlag(flag) {
          if (!(flag === "SIMPLE" || flag === "OR" || flag === "AND")) {
            throw new Error("Requested task is not a valid type in this method");
          }
        },
        "bad syntax": function badSyntax(expr) {
          if (_this3._type(expr, "function")) {
            return true;
          }
          if (_this3._type(expr, "boolean")) {
            return false;
          }
          if (expr.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) {
            throw new Error("Expression must be single-statement-only");
          }
        }
      }[name](val);
    }
  }, {
    key: "testTargets",
    get: function get() {
      return this.targets;
    },
    set: function set(targetObj) {
      this.targets = targetObj;
      this.history = [];
      this.matched = false;
      this.result = null;
    }
  }, {
    key: "history",
    get: function get() {
      return this.record;
    },
    set: function set(entry) {
      this.record = entry;
    }
  }]);

  return SwitchCase;
}();

module.exports = SwitchCase;