var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SwitchCase = require("./SwitchCase");

var SwitchInterface = function (_SwitchCase) {
  _inherits(SwitchInterface, _SwitchCase);

  function SwitchInterface() {
    _classCallCheck(this, SwitchInterface);

    return _possibleConstructorReturn(this, (SwitchInterface.__proto__ || Object.getPrototypeOf(SwitchInterface)).apply(this, arguments));
  }

  _createClass(SwitchInterface, [{
    key: "_init",
    value: function _init(isSimple, rules) {
      this.rules = rules;
      this.simpleExp = isSimple;
      return this;
    }
  }, {
    key: "toCase",
    value: function toCase(exprs, values, fn) {
      Array.isArray(exprs) ? this.match(this._interpret(exprs), values, fn, "OR") : this.match(this._interpret(exprs), values, fn, "SIMPLE");
      return this;
    }
  }, {
    key: "toCaseOR",
    value: function toCaseOR(exprs, values, fn) {
      this.match(this._interpret(exprs), values, fn, "OR");
      return this;
    }
  }, {
    key: "toCaseAND",
    value: function toCaseAND(exprs, values, fn) {
      this.match(this._interpret(exprs), values, fn, "AND");
      return this;
    }
  }, {
    key: "toAllOther",
    value: function toAllOther(values, fn) {
      this.match("true", values, fn, "SIMPLE");
      return this;
    }
  }, {
    key: "Ended",
    value: function Ended(fn) {
      var _this2 = this;

      var debug = function debug(options) {
        var targets = _this2.testTargets;
        console.log(options ? targets[options] : targets);
      };
      return fn(debug, this.result);
    }
  }, {
    key: "_interpret",
    value: function _interpret(expression) {
      var exprs = this._isArray(expression);
      if (this._screen(exprs)) {
        throw new Error("individual expression must not exceed more than " + this.rules.limit + " characters " + ("and must not contain keywords such as " + this.rules.keywords.join(", ") + " etc."));
      }
      return this.simpleExp ? this._verbose(exprs) : exprs;
    }
  }, {
    key: "_screen",
    value: function _screen(exprs) {
      var pattern = this.rules.keywords.join("|") + "|.{" + this.rules.limit + ",}";
      var regexp = new RegExp(pattern);

      for (var i = 0, len = exprs.length; i < len; i++) {
        if (typeof exprs[i] === "function") {
          continue;
        }
        if (regexp.test(exprs[i])) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "_verbose",
    value: function _verbose(exprs) {
      if (typeof exprs === "function") {
        return exprs;
      }
      var name = this.testTargets.args[0];
      var mapping = function mapping(expression) {
        var simple = expression.toString().match(/^\b([\w]+)\b$|^([><=]={0,2})([\s.\d]+)$/);
        return simple ? name + " " + (simple[2] || (+expression ? "==" : "===")) + " \"" + (simple[1] || simple[3]) + "\"" : expression;
      }; // mathcing in sequence of "value", "operator", "following value"
      return exprs.map(mapping);
    }
  }]);

  return SwitchInterface;
}(SwitchCase);

module.exports = SwitchInterface;