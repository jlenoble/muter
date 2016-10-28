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

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Muter(logger, method) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  if (logger === process || logger === undefined) {
    return Muter([process.stdout, 'write'], [process.stderr, 'write']);
  } else if (logger === console && method === undefined) {
    return Muter([console, 'log'], [console, 'info'], [console, 'warn'], [console, 'error']);
  } else if (logger === _gulp2.default || logger === _gulpUtil2.default) {
    return Muter([console, 'log'], [process.stdout, 'write']);
  } else if (Array.isArray(logger)) {
    var muter = Object.create(_advancedMuter2.default.prototype);
    _advancedMuter2.default.apply(muter, arguments);
    return muter;
  } else if (Object.keys(options).length > 0) {
    return Muter([logger, method, options]);
  } else {
    return new _simpleMuter2.default(logger, method);
  }
}

function muted(muter, func) {
  return function () {
    muter.mute();
    try {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var ret = func.apply(this, args);
      if (ret instanceof Promise) {
        ret = ret.then(function (res) {
          muter.unmute();
          return res;
        }, function (err) {
          muter.unmute();
          throw err;
        });
      } else {
        muter.unmute();
      }
      return ret;
    } catch (e) {
      muter.unmute();
      throw e;
    }
  };
};

function captured(muter, func) {
  return function () {
    muter.capture();
    try {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var ret = func.apply(this, args);
      if (ret instanceof Promise) {
        ret = ret.then(function (res) {
          muter.uncapture();
          return res;
        }, function (err) {
          muter.uncapture();
          throw err;
        });
      } else {
        muter.uncapture();
      }
      return ret;
    } catch (e) {
      muter.uncapture();
      throw e;
    }
  };
};

Muter.muted = muted;
Muter.captured = captured;