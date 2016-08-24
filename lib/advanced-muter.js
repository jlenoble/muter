'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _muters = Symbol();
var _messages = Symbol();
var _listener = Symbol();

var AdvancedMuter = function () {
  function AdvancedMuter() {
    var _this = this;

    _classCallCheck(this, AdvancedMuter);

    this[_muters] = new Map();
    this[_messages] = [];
    this[_listener] = function (args, format, endString) {
      _this[_messages].push(format.apply(undefined, _toConsumableArray(args)) + endString);
    };

    for (var _len = arguments.length, loggers = Array(_len), _key = 0; _key < _len; _key++) {
      loggers[_key] = arguments[_key];
    }

    loggers.forEach(function (logger) {
      var muter = _this[_muters].get(logger[0][logger[1]]);
      if (!muter) {
        muter = new _simpleMuter2.default(logger[0], logger[1], logger[2]);
        _this[_muters].set(logger[0][logger[1]], muter);
        muter.on('log', _this[_listener]);
      } else {
        throw new Error('Interleaving same logger twice: ' + logger);
      }
    });
  }

  _createClass(AdvancedMuter, [{
    key: 'mute',
    value: function mute() {
      this[_muters].forEach(function (muter) {
        muter.mute();
      });
    }
  }, {
    key: 'getLogs',
    value: function getLogs(color) {
      var message = this[_messages].join('');
      if (message) {
        return message;
      }
    }
  }]);

  return AdvancedMuter;
}();

exports.default = AdvancedMuter;
module.exports = exports['default'];