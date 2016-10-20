'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _uppercamelcase = require('uppercamelcase');

var _uppercamelcase2 = _interopRequireDefault(_uppercamelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _muters = Symbol();
var _options = Symbol();

var _key = Symbol();
var _loggerKeys = Symbol();
var _loggerKeyCounter = Symbol();

var _fullLogs = Symbol();
var _individualLogs = Symbol();
var _listener = Symbol();

var _isListening = Symbol();
var _startListening = Symbol();
var _stopListening = Symbol();

function startListening() {
  var _this = this;

  if (this.isListening) {
    // Prevents from attaching same listener multiple times
    return;
  }
  this[_muters].forEach(function (muter) {
    muter.on('log', _this[_listener]);
  });
  this.isListening = true;
}

function stopListening() {
  var _this2 = this;

  if (!this.isListening) {
    return;
  }
  this[_muters].forEach(function (muter) {
    muter.removeListener('log', _this2[_listener]);
  });
  this.isListening = false;
}

function makeGetter(name) {
  return function () {
    if (!this.isListening) {
      return false;
    }
    var isName = 'is' + (0, _uppercamelcase2.default)(name);
    var muting;
    [].concat(_toConsumableArray(this[_muters].values())).forEach(function (muter) {
      if (muting === undefined) {
        muting = muter[isName];
      } else {
        if (muting !== muter[isName]) {
          throw new Error('Muters referenced by advanced Muter have inconsistent ' + name + ' states');
        }
      }
    });
    return muting;
  };
};

var AdvancedMuter = function () {
  function AdvancedMuter() {
    var _this3 = this,
        _properties;

    _classCallCheck(this, AdvancedMuter);

    var properties = (_properties = {}, _defineProperty(_properties, _muters, { value: new Map() }), _defineProperty(_properties, _options, { value: new Map() }), _defineProperty(_properties, _key, { value: function value(logger, method) {
        var loggerKey = _this3[_loggerKeys].get(logger);
        if (!loggerKey) {
          _this3[_loggerKeyCounter]++;
          loggerKey = 'logger' + _this3[_loggerKeyCounter];
          _this3[_loggerKeys].set(logger, loggerKey);
        }
        return loggerKey + '_' + method;
      } }), _defineProperty(_properties, _loggerKeys, { value: new Map() }), _defineProperty(_properties, _loggerKeyCounter, { value: 0, writable: true }), _defineProperty(_properties, _fullLogs, { value: [] }), _defineProperty(_properties, _individualLogs, { value: new Map() }), _defineProperty(_properties, _listener, { value: function value(args, muter) {
        var key = _this3[_key](muter.logger, muter.method);
        var options = _this3[_options].get(key);
        var logs = _this3[_individualLogs].get(key);

        var color = options.color;
        var format = options.format;
        var endString = options.endString;

        if (!color) {
          color = muter.color;
        }

        if (!format) {
          format = muter.format;
        }

        if (!endString) {
          endString = muter.endString;
        }

        var log = {
          args: args, color: color, format: format, endString: endString,
          boundOriginal: muter.boundOriginal
        };

        logs.push(log);

        _this3[_fullLogs].push(log);
      } }), _defineProperty(_properties, _startListening, { value: startListening }), _defineProperty(_properties, _stopListening, { value: stopListening }), _defineProperty(_properties, _isListening, { value: false, writable: true }), _defineProperty(_properties, 'isListening', {
      get: function get() {
        return this[_isListening];
      },
      set: function set(bool) {
        this[_isListening] = !!bool;
      }
    }), _defineProperty(_properties, 'isMuting', {
      get: makeGetter('muting')
    }), _defineProperty(_properties, 'isCapturing', {
      get: makeGetter('capturing')
    }), _defineProperty(_properties, 'isActivated', {
      get: makeGetter('activated')
    }), _properties);

    Object.defineProperties(this, properties);

    for (var _len = arguments.length, loggers = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      loggers[_key2] = arguments[_key2];
    }

    loggers.forEach(function (logger) {
      var key = _this3[_key](logger[0], logger[1]);

      var muter = _this3[_muters].get(key);

      if (muter) {
        throw new Error('Interleaving same logger twice');
      }

      muter = new _simpleMuter2.default(logger[0], logger[1]);

      var options = logger[2];
      if (!options) {
        options = {};
      }

      _this3[_muters].set(key, muter);
      _this3[_options].set(key, {
        color: options.color,
        format: options.format,
        endString: options.endString
      });
      _this3[_individualLogs].set(key, []);
    });
  }

  _createClass(AdvancedMuter, [{
    key: 'mute',
    value: function mute() {
      if (this.isListening) {
        return;
      }
      this[_muters].forEach(function (muter) {
        muter.mute();
      });
      this[_startListening]();
    }
  }, {
    key: 'capture',
    value: function capture() {
      if (this.isListening) {
        return;
      }
      this[_muters].forEach(function (muter) {
        muter.capture();
      });
      this[_startListening]();
    }
  }, {
    key: 'unmute',
    value: function unmute() {
      var _this4 = this;

      if (!this.isListening) {
        return;
      }
      this[_muters].forEach(function (muter) {
        if (muter.listenerCount('log') <= 1) {
          muter.unmute();
        }

        var key = _this4[_key](muter.logger, muter.method);
        _this4[_individualLogs].get(key).length = 0;
      });
      this[_fullLogs].length = 0;
      this[_stopListening]();
    }
  }, {
    key: 'uncapture',
    value: function uncapture() {
      var _this5 = this;

      if (!this.isListening) {
        return;
      }
      this[_muters].forEach(function (muter) {
        if (muter.listenerCount('log') <= 1) {
          muter.uncapture();
        }

        var key = _this5[_key](muter.logger, muter.method);
        _this5[_individualLogs].get(key).length = 0;
      });
      this[_fullLogs].length = 0;
      this[_stopListening]();
    }
  }, {
    key: 'repair',
    value: function repair() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { mute: true };

      var mute = options.mute ? 'mute' : 'capture';
      var unmute = 'un' + mute;
      if (this.isListening) {
        this[_muters].forEach(function (muter) {
          muter[mute]();
        });
      } else {
        this[_muters].forEach(function (muter) {
          muter[unmute]();
        });
      }
    }
  }, {
    key: 'getLogs',
    value: function getLogs() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this.isActivated) {
        var logs;

        if (options.logger && options.method) {
          logs = this[_individualLogs].get(this[_key](options.logger, options.method));
        } else {
          logs = this[_fullLogs];
        }

        return logs.map(function (log) {
          var _color = options.color ? options.color : log.color;
          var format = options.format ? options.format : log.format;
          var endString = options.endString ? options.endString : log.endString;
          var message = format.apply(undefined, _toConsumableArray(log.args)) + endString;
          return _color ? _chalk2.default[_color](message) : message;
        }).join('');
      }
    }
  }, {
    key: 'flush',
    value: function flush() {
      var _this6 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs(options);

      this[_fullLogs].forEach(function (log) {
        log.boundOriginal.apply(log, _toConsumableArray(log.args));
      });

      this[_fullLogs].length = 0;
      this[_muters].forEach(function (muter) {
        muter.forget();

        var key = _this6[_key](muter.logger, muter.method);
        _this6[_individualLogs].get(key).length = 0;
      });

      return logs;
    }
  }, {
    key: 'forget',
    value: function forget() {
      var _this7 = this;

      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs();
      this[_fullLogs].length = 0;
      this[_muters].forEach(function (muter) {
        muter.forget();

        var key = _this7[_key](muter.logger, muter.method);
        _this7[_individualLogs].get(key).length = 0;
      });

      return logs;
    }
  }]);

  return AdvancedMuter;
}();

exports.default = AdvancedMuter;
module.exports = exports['default'];