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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var muters = new Map();

function Muter(logger, method) {

  var muter = muters.get(logger[method]);

  if (muter) {
    return muter;
  }

  var usesStdout = process.stdout && logger === console && (method === 'log' || method === 'info');
  var usesStderr = process.stderr && logger === console && (method === 'warn' || method === 'error');

  function _unmute() {
    if (logger[method].restore) {
      logger[method].restore();
    }

    if (usesStdout && process.stdout.write.restore) {
      process.stdout.write.restore();
    }

    if (usesStderr && process.stderr.write.restore) {
      process.stderr.write.restore();
    }
  }

  muter = {
    mute: function mute() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {
        muteProcessStdout: false,
        muteProcessStderr: false
      } : arguments[0];

      _sinon2.default.stub(logger, method);

      if (options.muteProcessStdout) {
        // Silence also process.stdout for full muting.
        _sinon2.default.stub(process.stdout, 'write');
      } else if (options.muteProcessStderr) {
        // Silence also process.stderr for full muting.
        _sinon2.default.stub(process.stderr, 'write');
      }
    },
    unmute: function unmute() {
      _unmute();
    },
    getLogs: function getLogs(color) {
      if (logger[method].restore) {
        var calls = logger[method].getCalls();

        calls = calls.map(function (call) {
          return _util2.default.format.apply(_util2.default, _toConsumableArray(call.args));
        });

        calls = calls.join('\n');

        return color ? _chalk2.default[color](calls) : calls;
      }
    },
    capture: function capture() {
      if (usesStdout) {
        _sinon2.default.stub(logger, method, function () {
          return process.stdout.write(_util2.default.format.apply(_util2.default, arguments) + '\n');
        });
      } else if (usesStderr) {
        _sinon2.default.stub(logger, method, function () {
          return process.stderr.write(_util2.default.format.apply(_util2.default, arguments) + '\n');
        });
      }
    },
    uncapture: function uncapture() {
      _unmute();
    }
  };

  muters.set(logger[method], muter);

  return muter;
}

exports.default = Muter;