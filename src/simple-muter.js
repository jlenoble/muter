import sinon from 'sinon';
import chalk from 'chalk';
import util from 'util';
import EventEmitter from 'events';

var muters = new Map();

function formatter(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return util.format;
  } else if ([process.stdout, process.stderr].includes(logger) &&
    method === 'write') {
    return (chunk, encoding) => chunk.toString(encoding);
  } else {
    return (...args) => args.join(' ');
  }
}

function endString(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return '\n';
  } else if ([process.stdout, process.stderr].includes(logger) &&
    method === 'write') {
    return '';
  } else {
    return '\n';
  }
}

function unmuter(logger, method) {
  return () => {
    const func = logger[method];
    if (func.restore && func.restore.sinon) {
      func.restore();
    }
  };
}

const _isMuting = Symbol();
const _isCapturing = Symbol();

class SimpleMuter extends EventEmitter {

  constructor(logger, method, options = {}) {

    super();

    var muter = muters.get(logger[method]);

    if (muter) {
      return muter;
    }

    muter = this;

    const properties = {

      logger: {value: logger},
      method: {value: method},
      original: {value: logger[method]},
      boundOriginal: {value: logger[method].bind(logger)},

      format: {value: options.format ? options.format :
        formatter(logger, method)},
      endString: {value: options.endString ? options.endString :
        endString(logger, method)},

      _unmute: {value: unmuter(logger, method)},

      [_isMuting]: {value: false, writable: true},
      [_isCapturing]: {value: false, writable: true},

      isMuting: {
        get() {return this[_isMuting];},
        set(bool) {
          if (bool) {
            this[_isMuting] = true;
            this[_isCapturing] = false;
          } else {
            this[_isMuting] = false;
          }
        }
      },

      isCapturing: {
        get() {return this[_isCapturing];},
        set(bool) {
          if (bool) {
            this[_isMuting] = false;
            this[_isCapturing] = true;
          } else {
            this[_isCapturing] = false;
          }
        }
      },

      isActivated: {
        get() {
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

    };

    Object.defineProperties(muter, properties);

    muters.set(logger[method], muter);

    return muter;

  }

  mute() {
    if (this.isActivated) {
      throw new Error(`Muter is already activated, don't call 'mute'`);
    }

    this.isMuting = true;

    sinon.stub(this.logger, this.method, (...args) => {
      this.emit('log', args);
    });
  }

  capture() {
    if (this.isActivated) {
      throw new Error(`Muter is already activated, don't call 'capture'`);
    }

    this.isCapturing = true;

    sinon.stub(this.logger, this.method, (...args) => {
      this.emit('log', args);
      this.boundOriginal(...args);
    });
  }

  unmute() {
    this._unmute();
    this.isMuting = false;
  }

  uncapture() {
    this._unmute();
    this.isCapturing = false;
  }

  getLogs(color) {
    if (this.isActivated) {
      var calls = this.logger[this.method].getCalls();

      calls = calls.map(call => {
        return this.format(...call.args);
      });

      calls = calls.join(this.endString);

      return color ? chalk[color](calls) : calls;
    }
  }

  flush(color) {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(color);
    this._unmute();
    this.logger[this.method](logs);

    if (this.isMuting) {
      this.mute();
    } else if (this.isCapturing) {
      this.capture();
    } else {
      throw new Error('Muter was neither muting nor capturing, ' +
        'yet trying to remute/recapture after flushing');
    }

    return logs;
  }

}

export default SimpleMuter;
