'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Muter;
exports.muted = muted;
exports.captured = captured;

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

var _advancedMuter = require('./advanced-muter');

var _advancedMuter2 = _interopRequireDefault(_advancedMuter);

var _cleanupWrapper = require('cleanup-wrapper');

var _cleanupWrapper2 = _interopRequireDefault(_cleanupWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Muter(logger, method) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (logger === process || logger === undefined) {
    return new Muter([process.stdout, 'write'], [process.stderr, 'write']);
  } else if (logger === console && method === undefined) {
    return new Muter([console, 'log'], [console, 'info'], [console, 'warn'], [console, 'error']);
  } else if (Array.isArray(logger)) {
    // eslint-disable-next-line prefer-rest-params
    return new (Function.prototype.bind.apply(_advancedMuter2.default, [null].concat(Array.prototype.slice.call(arguments))))();
  } else if (Object.keys(options).length > 0) {
    return new Muter([logger, method, options]);
  } else {
    return new _simpleMuter2.default(logger, method);
  }
}

function muted(muter, func) {
  return (0, _cleanupWrapper2.default)(func, {
    muter: muter,
    before: function before() {
      this.muter.mute();
    },
    after: function after() {
      this.muter.unmute();
    }
  });
};

function captured(muter, func) {
  return (0, _cleanupWrapper2.default)(func, {
    muter: muter,
    before: function before() {
      this.muter.capture();
    },
    after: function after() {
      this.muter.uncapture();
    }
  });
};

Muter.muted = muted;
Muter.captured = captured;