'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var muters = new Map();

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

function Muter(logger, method) {
  var _muter;

  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


  var format = options.format ? options.format : formatter(logger, method);
  var end = options.endString ? options.endString : endString(logger, method);

  var muter = muters.get(logger[method]);

  if (muter) {
    return muter;
  }

  function _unmute() {
    if (logger[method].restore) {
      logger[method].restore();
    }
  }

  var _isMuting = Symbol();
  var _isCapturing = Symbol();

  muter = (_muter = {}, _defineProperty(_muter, _isMuting, false), _defineProperty(_muter, _isCapturing, false), _defineProperty(_muter, 'mute', function mute() {
    if (this.isActivated) {
      throw new Error('Muter is already activated, don\'t call \'mute\'');
    }

    this.isMuting = true;

    _sinon2.default.stub(logger, method);
  }), _defineProperty(_muter, 'unmute', function unmute() {
    _unmute();
    this.isMuting = false;
  }), _defineProperty(_muter, 'getLogs', function getLogs(color) {
    if (this.isActivated) {
      var calls = logger[method].getCalls();

      calls = calls.map(function (call) {
        return format.apply(undefined, _toConsumableArray(call.args));
      });

      calls = calls.join(end);

      return color ? _chalk2.default[color](calls) : calls;
    }
  }), _defineProperty(_muter, 'capture', function capture() {
    if (this.isActivated) {
      throw new Error('Muter is already activated, don\'t call \'capture\'');
    }

    this.isCapturing = true;

    _sinon2.default.stub(logger, method, logger[method]);
  }), _defineProperty(_muter, 'uncapture', function uncapture() {
    _unmute();
    this.isCapturing = false;
  }), _defineProperty(_muter, 'flush', function flush(color) {
    if (!this.isActivated) {
      return;
    }

    var logs = this.getLogs(color);
    _unmute();
    logger[method](logs);

    if (this.isMuting) {
      this.mute();
    } else if (this.isCapturing) {
      this.capture();
    } else {
      throw new Error('Muter was neither muting nor capturing, ' + 'yet trying to remute/recapture after flushing');
    }

    return logs;
  }), _muter);

  Object.defineProperties(muter, {
    isMuting: {
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
    },
    isCapturing: {
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
    },
    isActivated: {
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
    }
  });

  muters.set(logger[method], muter);

  return muter;
}

exports.default = Muter;
module.exports = exports['default'];