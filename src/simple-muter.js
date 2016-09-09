import sinon from 'sinon';
import chalk from 'chalk';
import util from 'util';
import EventEmitter from 'events';

var muters = new Map();
var loggerKeys = new Map();
var loggerKeyCounter = 0;

function key(logger, method) {
  var loggerKey = loggerKeys.get(logger);
  if (!loggerKey) {
    loggerKeyCounter++;
    loggerKey = `logger${loggerKeyCounter}`;
    loggerKeys.set(logger, loggerKey);
  }
  return `${loggerKey}_${method}`;
}

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
const _unmute = Symbol();

class SimpleMuter extends EventEmitter {

  constructor(logger, method) {

    super();

    var muter = muters.get(key(logger, method));

    if (muter) {
      return muter;
    }

    muter = this;

    const properties = {

      logger: {value: logger},
      method: {value: method},
      original: {value: logger[method]},
      boundOriginal: {value: logger[method].bind(logger)},

      format: {value: formatter(logger, method)},
      endString: {value: endString(logger, method)},

      [_unmute]: {value: unmuter(logger, method)},

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

    muters.set(key(logger, method), muter);

    return muter;

  }

  mute() {
    if (this.isActivated) {
      return;
    }

    this.isMuting = true;

    sinon.stub(this.logger, this.method, (...args) => {
      this.emit('log', args, this);
    });
  }

  capture() {
    if (this.isActivated) {
      return;
    }

    this.isCapturing = true;

    sinon.stub(this.logger, this.method, (...args) => {
      this.emit('log', args, this);
      this.boundOriginal(...args);
    });
  }

  unmute() {
    this[_unmute]();
    this.isMuting = false;
  }

  uncapture() {
    this[_unmute]();
    this.isCapturing = false;
  }

  print(nth) {
    if (this.isActivated) {
      if (nth >= 0) {
        var call = this.logger[this.method].getCalls()[nth];

        this.boundOriginal(...call.args);
      } else {
        var calls = this.logger[this.method].getCalls();

        calls.forEach(call => {
          this.boundOriginal(...call.args);
        });
      }
    }
  }

  getLog(nth, color) {
    if (this.isActivated) {
      var call = this.logger[this.method].getCalls()[nth];

      call = this.format(...call.args) + this.endString;

      if (!color && this.color) {
        color = this.color;
      }

      return color ? chalk[color](call) : call;
    }
  }

  getLogs(options = {}) {
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

      calls = calls.map(call => {
        return format(...call.args) + endString;
      });

      calls = calls.join('');

      return color ? chalk[color](calls) : calls;
    }
  }

  flush(options = {}) {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(options);

    var calls = this.logger[this.method].getCalls();
    calls.forEach(call => {
      this.boundOriginal(...call.args);
    });

    this[_unmute]();

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

  forget() {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs();
    this[_unmute]();

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
