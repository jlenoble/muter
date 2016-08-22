'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleMuter = require('./simple-muter');

var _simpleMuter2 = _interopRequireDefault(_simpleMuter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Muter(logger, method) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return new _simpleMuter2.default(logger, method, options);
}

exports.default = Muter;
module.exports = exports['default'];