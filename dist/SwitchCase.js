var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SwitchCase = function () {
  function SwitchCase() {
    _classCallCheck(this, SwitchCase);
  }

  _createClass(SwitchCase, [{
    key: "setTargets",
    value: function setTargets() {
      for (var _len = arguments.length, targets = Array(_len), _key = 0; _key < _len; _key++) {
        targets[_key] = arguments[_key];
      }

      this._testForError("targets", targets);
      var collection = { targets: {}, args: [], values: [] };

      var setArrToObj = function setArrToObj(obj, item) {
        return Object.assign(obj, item);
      };
      var setObjToMap = function setObjToMap(collection, elem) {
        collection.args.push(elem[0]);
        collection.values.push(elem[1]);
        return collection;
      };

      collection.targets = targets.reduce(setArrToObj, {});
      this.testTargets = Object.entries(collection.targets).reduce(setObjToMap, collection);
      return this;
    }

    // @ param is the native interface of SwitchCase
    // will need to implement typecheck

  }, {
    key: "match",
    value: function match(exp, values, fn, flag) {
      this._testForError("expression", exp);
      if (this.isMatched) {
        return this;
      }

      var _ref = arguments.length <= 3 ? [fn, null] : [flag, fn];

      var _ref2 = _slicedToArray(_ref, 2);

      flag = _ref2[0];
      fn = _ref2[1];

      var _ref3 = typeof values === "function" ? [null, values] : [values, fn];

      var _ref4 = _slicedToArray(_ref3, 2);

      values = _ref4[0];
      fn = _ref4[1];


      var expr = this._setExpression(exp);
      var matching = flag === "SIMPLE" ? this._evaluateOne(expr.get(0)) : this._evaluateMany(expr, flag);

      matching && this._break(values, fn);
      return this;
    }
  }, {
    key: "end",
    value: function end(fn) {
      var _this = this;

      var debug = function debug() {
        console.log(_this.testTargets);
      };
      return fn(debug, this.result);
    }
  }, {
    key: "_break",
    value: function _break(val, fn) {
      this.isMatched = true;
      this.result = typeof fn === "function" ? fn(val) : val;
      return true;
    }
  }, {
    key: "_setExpression",
    value: function _setExpression(expressions) {
      var exprs = this._isArray(expressions);
      var aCase = new Map();
      var len = exprs.length;
      for (var i = 0; i < len; i++) {
        aCase.set(i, exprs[i]);
      }
      return aCase;
    }
  }, {
    key: "_evaluateMany",
    value: function _evaluateMany(expr, flag) {
      var boolSet = {
        "OR": [true, false],
        "AND": [false, true]
      };
      if (!(flag in boolSet)) {
        throw new Error("Requested task is not a valid type in this method");
      }
      for (var i = 0; i < expr.size; i++) {
        if (boolSet[flag][0] ? this._evaluateOne(expr.get(i)) : !this._evaluateOne(expr.get(i))) {
          return boolSet[flag][0];
        }
      }
      return boolSet[flag][1];
    }
  }, {
    key: "_evaluateOne",
    value: function _evaluateOne(expression) {
      var testTargets = this.testTargets;
      return this._matchingExpression(expression, testTargets);
    }
  }, {
    key: "_matchingExpression",
    value: function _matchingExpression(expression, _ref5) {
      var targets = _ref5.targets,
          args = _ref5.args,
          values = _ref5.values;

      this._testForError("filter", expression);
      var statement = "return " + expression;
      var functionExp = Function.apply(undefined, _toConsumableArray(args).concat([statement]));
      try {
        return typeof expression === "function" ? expression(targets) : functionExp.apply(undefined, _toConsumableArray(values));
      } catch (err) {
        throw err;
      }
    }
  }, {
    key: "_isArray",
    value: function _isArray(expr) {
      return Array.isArray(expr) ? expr : [expr];
    }
  }, {
    key: "_testForError",
    value: function _testForError(name, val) {
      return {
        targets: function targets(_targets) {
          // because of rest syntax targets is always going to be an array
          if (!_targets || _typeof(_targets[0]) !== "object") {
            throw new TypeError("TestTargets cannot be null or undefined");
          }
        },
        expression: function expression(exp) {
          var expcheck = typeof exp === "string" || typeof exp === "function" || Array.isArray(exp) || false;
          if (!expcheck) {
            throw new TypeError("An expression must be a string, array of string, or a function");
          }
        },
        filter: function filter(exp) {
          if (typeof exp === "function") {
            return;
          }
          if (exp.match(/[\w]+\s*(?=\(.*\)|\([^-+*%/]+\))|{.+}|.+;.+/)) {
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
      this.isMatched = false;
      this.result = null;
    }
  }, {
    key: "isMatched",
    get: function get() {
      return this.matched;
    },
    set: function set(bool) {
      this.matched = bool;
    }
  }]);

  return SwitchCase;
}();

module.exports = SwitchCase;