'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _muters = Symbol();
var _options = Symbol();

var _key = Symbol();
var _loggerKeys = Symbol();
var _loggerKeyCounter = Symbol();

var _logs = Symbol();
var _listener = Symbol();

var _startListening = Symbol();
var _stopListening = Symbol();

function startListening() {
  var _this = this;

  this[_muters].forEach(function (muter) {
    muter.on('log', _this[_listener]);
  });
}

function stopListening() {
  var _this2 = this;

  this[_muters].forEach(function (muter) {
    muter.removeListener('log', _this2[_listener]);
  });
}

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
      } }), _defineProperty(_properties, _loggerKeys, { value: new Map() }), _defineProperty(_properties, _loggerKeyCounter, { value: 0, writable: true }), _defineProperty(_properties, _logs, { value: [] }), _defineProperty(_properties, _listener, { value: function value(args, muter) {
        var key = _this3[_key](muter.logger, muter.method);
        var color = _this3[_options].get(key).color;
        if (!color) {
          color = muter.color;
        }

        _this3[_logs].push({
          args: args,
          format: muter.format,
          endString: muter.endString,
          boundOriginal: muter.boundOriginal,
          color: color,
          message: muter.format.apply(muter, _toConsumableArray(args)) + muter.endString
        });
      } }), _defineProperty(_properties, _startListening, { value: startListening }), _defineProperty(_properties, _stopListening, { value: stopListening }), _defineProperty(_properties, 'isMuting', {
      get: function get() {
        var muting;
        [].concat(_toConsumableArray(this[_muters].values())).forEach(function (muter) {
          if (muting === undefined) {
            muting = muter.isMuting;
          } else {
            if (muting !== muter.isMuting) {
              throw new Error('Muters referenced by advanced Muter have inconsistent muting state');
            }
          }
        });
        return muting;
      }
    }), _defineProperty(_properties, 'isCapturing', {
      get: function get() {
        var muting;
        [].concat(_toConsumableArray(this[_muters].values())).forEach(function (muter) {
          if (muting === undefined) {
            muting = muter.isCapturing;
          } else {
            if (muting !== muter.isCapturing) {
              throw new Error('Muters referenced by advanced Muter have inconsistent capturing state');
            }
          }
        });
        return muting;
      }
    }), _defineProperty(_properties, 'isActivated', {
      get: function get() {
        var muting;
        [].concat(_toConsumableArray(this[_muters].values())).forEach(function (muter) {
          if (muting === undefined) {
            muting = muter.isActivated;
          } else {
            if (muting !== muter.isActivated) {
              throw new Error('Muters referenced by advanced Muter have inconsistent activated state');
            }
          }
        });
        return muting;
      }
    }), _properties);

    Object.defineProperties(this, properties);

    for (var _len = arguments.length, loggers = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      loggers[_key2] = arguments[_key2];
    }

    loggers.forEach(function (logger) {
      var muter = _this3[_muters].get(_this3[_key](logger[0], logger[1]));

      if (muter) {
        throw new Error('Interleaving same logger twice');
      }

      muter = new _simpleMuter2.default(logger[0], logger[1], logger[2]);

      var options = logger[2];
      if (!options) {
        options = {};
      }

      _this3[_muters].set(_this3[_key](logger[0], logger[1]), muter);
      _this3[_options].set(_this3[_key](logger[0], logger[1]), {
        color: options.color
      });
    });
  }

  _createClass(AdvancedMuter, [{
    key: 'mute',
    value: function mute() {
      this[_muters].forEach(function (muter) {
        muter.mute();
      });
      this[_startListening]();
    }
  }, {
    key: 'capture',
    value: function capture() {
      this[_muters].forEach(function (muter) {
        muter.capture();
      });
      this[_startListening]();
    }
  }, {
    key: 'unmute',
    value: function unmute() {
      this[_muters].forEach(function (muter) {
        muter.unmute();
      });
      this[_logs].length = 0;
      this[_stopListening]();
    }
  }, {
    key: 'uncapture',
    value: function uncapture() {
      this[_muters].forEach(function (muter) {
        muter.uncapture();
      });
      this[_logs].length = 0;
      this[_stopListening]();
    }
  }, {
    key: 'getLogs',
    value: function getLogs(color) {
      if (this.isActivated) {
        return this[_logs].map(function (log) {
          var _color = color ? color : log.color;
          return _color ? _chalk2.default[_color](log.message) : log.message;
        }).join('');
      }
    }
  }, {
    key: 'flush',
    value: function flush(color) {
      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs(color);

      this[_logs].forEach(function (log) {
        log.boundOriginal.apply(log, _toConsumableArray(log.args));
      });

      this[_logs].length = 0;
      this[_muters].forEach(function (muter) {
        muter.forget();
      });

      return logs;
    }
  }, {
    key: 'forget',
    value: function forget() {
      if (!this.isActivated) {
        return;
      }

      var logs = this.getLogs(color);
      this[_logs].length = 0;
      this[_muters].forEach(function (muter) {
        muter.forget();
      });

      return logs;
    }
  }]);

  return AdvancedMuter;
}();

exports.default = AdvancedMuter;
module.exports = exports['default'];