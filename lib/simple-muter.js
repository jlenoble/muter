'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var muters = new Map();
var loggerKeys = new Map();
var loggerKeyCounter = 0;

function key(logger, method) {
  var loggerKey = loggerKeys.get(logger);
  if (!loggerKey) {
    loggerKeyCounter++;
    loggerKey = 'logger' + loggerKeyCounter;
    loggerKeys.set(logger, loggerKey);
  }
  return loggerKey + '_' + method;
}

function formatter(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return _util2.default.format;
  } else if ([process.stdout, process.stderr].includes(logger) && method === 'write') {
    return function (chunk, encoding) {
      return chunk.toString(encoding);
    };
  } else {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.join(' ');
    };
  }
}

function endString(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return '\n';
  } else if ([process.stdout, process.stderr].includes(logger) && method === 'write') {
    return '';
  } else {
    return '\n';
  }
}

function unmuter(logger, method) {
  return function () {
    var func = logger[method];
    if (func.restore && func.restore.sinon) {
      func.restore();
    }
  };
}

var _isMuting = Symbol();
var _isCapturing = Symbol();
var _unmute = Symbol();

var SimpleMuter = function (_EventEmitter) {
  _inherits(SimpleMuter, _EventEmitter);

  function SimpleMuter(logger, method) {
    var _properties;

    var _ret2;

    _classCallCheck(this, SimpleMuter);

    var _this = _possibleConstructorReturn(this, (SimpleMuter.__proto__ || Object.getPrototypeOf(SimpleMuter)).call(this));

    var muter = muters.get(key(logger, method));

    if (muter) {
      var _ret;

      return _ret = muter, _possibleConstructorReturn(_this, _ret);
    }

    muter = _this;

    var properties = (_properties = {

      logger: { value: logger },
      method: { value: method },
      original: { value: logger[method] },
      boundOriginal: { value: logger[method].bind(logger) },

      format: { value: formatter(logger, method) },
      endString: { value: endString(logger, method) }

    }, _defineProperty(_properties, _unmute, { value: unmuter(logger, method) }), _defineProperty(_properties, _isMuting, { value: false, writable: true }), _defineProperty(_properties, _isCapturing, { value: false, writable: true }), _defineProperty(_properties, 'isMuting', {
      get: function get() {
        return this[_isMuting];
      },
      set: function set(bool) {
        if (bool) {
          this[_isMuting] = true;
          this[_isCapturing] = false;
        } else {
          this[_isMuting] = false;
        }
      }
    }), _defineProperty(_properties, 'isCapturing', {
      get: function get() {
        return this[_isCapturing];
      },
      set: function set(bool) {
        if (bool) {
          this[_isMuting] = false;
          this[_isCapturing] = true;
        } else {
          this[_isCapturing] = false;
        }
      }
    }), _defineProperty(_properties, 'isActivated', {
      get: function get() {
        if (logger[method].restore) {
          return true;
        } else {
          // Fix states in case logger was restored somewhere else
          this.isMuting = false;
          this.isCapturing = false;
          return false;
        }
      }
    }), _properties);

    Object.defineProperties(muter, properties);

    muters.set(key(logger, method), muter);

    return _ret2 = muter, _possibleConstructorReturn(_this, _ret2);
  }

  _createClass(SimpleMuter, [{
    key: 'mute',
    value: function mute() {
      var _this2 = this;

      if (this.isActivated) {
        return;
      }

      this.isMuting = true;

      _sinon2.default.stub(this.logger, this.method, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this2.emit('log', args, _this2);
      });
    }
  }, {
    key: 'capture',
    value: function capture() {
      var _this3 = this;

      if (this.isActivated) {
        return;
      }

      this.isCapturing = true;

      _sinon2.default.stub(this.logger, this.method, function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        _this3.emit('log', args, _this3);
        _this3.boundOriginal.apply(_this3, args);
      });
    }
  }, {
    key: 'unmute',
    value: function unmute() {
      this[_unmute]();
      this.isMuting = false;
    }
  }, {
    key: 'uncapture',
    value: function uncapture() {
      this[_unmute]();
      this.isCapturing = false;
    }
  }, {
    key: 'print',
    value: function print(nth) {
      var _this4 = this;

      if (this.isActivated) {
        if (nth >= 0) {
          var call = this.logger[this.method].getCalls()[nth];

          this.boundOriginal.apply(this, _toConsumableArray(call.args));
        } else {
          var calls = this.logger[this.method].getCalls();

          calls.forEach(function (call) {
            _this4.boundOriginal.apply(_this4, _toConsumableArray(call.args));
          });
        }
      }
    }
  }, {
    key: 'getLog',
    value: function getLog(nth, color) {
      if (this.isActivated) {
        var call = this.logger[this.method].getCalls()[nth];

        call = this.format.apply(this, _toConsumableArray(call.args)) + this.endString;

        if (!color && this.color) {
          color = this.color;
        }

        return color ? _chalk2.default[color](call) : call;
      }
    }
  }, {
    key: 'getLogs',
    value: function getLogs() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.isActivated) {
        var color = options.color;
        var format = options.format;
        var endString = options.endString;

        if (!format) {
          format = this.format;
        }

        if (!endString) {
          endString = this.endString;
        }

        var calls = this.logger[this.method].getCalls();

        calls = calls.map(function (call) {
          return format.apply(undefined, _toConsumableArray(call.args)) + endString;
        });

        calls = calls.join('');

        return color ? _chalk2.default[color](calls) : calls;
      }
    }
  }, {
    key: 'flush',
    value: function flush() {
      var _this5 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs(options);

      var calls = this.logger[this.method].getCalls();
      calls.forEach(function (call) {
        _this5.boundOriginal.apply(_this5, _toConsumableArray(call.args));
      });

      this[_unmute]();

      if (this.isMuting) {
        this.mute();
      } else if (this.isCapturing) {
        this.capture();
      } else {
        throw new Error('Muter was neither muting nor capturing, ' + 'yet trying to remute/recapture after flushing');
      }

      return logs;
    }
  }, {
    key: 'forget',
    value: function forget() {
      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs();
      this[_unmute]();

      if (this.isMuting) {
        this.mute();
      } else if (this.isCapturing) {
        this.capture();
      } else {
        throw new Error('Muter was neither muting nor capturing, ' + 'yet trying to remute/recapture after flushing');
      }

      return logs;
    }
  }]);

  return SimpleMuter;
}(_events2.default);

exports.default = SimpleMuter;
module.exports = exports['default'];