'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

var _advancedMuter = require('./advanced-muter');

var _advancedMuter2 = _interopRequireDefault(_advancedMuter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Muter(logger, method) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


  if (Array.isArray(logger)) {
    var muter = Object.create(_advancedMuter2.default.prototype);
    _advancedMuter2.default.apply(muter, arguments);
    return muter;
  } else {
    return new _simpleMuter2.default(logger, method, options);
  }
}

exports.default = Muter;
module.exports = exports['default'];