import SimpleMuter from './simple-muter';

import chalk from 'chalk';
import upperCamelCase from 'uppercamelcase';

const _muters = Symbol();
const _options = Symbol();

const _key = Symbol();
const _loggerKeys = Symbol();
const _loggerKeyCounter = Symbol();

const _fullLogs = Symbol();
const _individualLogs = Symbol();
const _listener = Symbol();

const _isListening = Symbol();
const _startListening = Symbol();
const _stopListening = Symbol();

function startListening() {
  if (this.isListening) { // Prevents from attaching same listener multiple times
    return;
  }
  this[_muters].forEach(muter => {
    muter.on('log', this[_listener]);
  });
  this.isListening = true;
}

function stopListening() {
  if (!this.isListening) {
    return;
  }
  this[_muters].forEach(muter => {
    muter.removeListener('log', this[_listener]);
  });
  this.isListening = false;
}

function makeGetter(name) {
  return function() {
    if (!this.isListening) {
      return false;
    }
    const isName = 'is' + upperCamelCase(name);
    var muting;
    [...this[_muters].values()].forEach(muter => {
      if (muting === undefined) {
        muting = muter[isName];
      } else {
        if (muting !== muter[isName]) {
          throw new Error(
  `Muters referenced by advanced Muter have inconsistent ${name} states`);
        }
      }
    });
    return muting;
  };
};

class AdvancedMuter {

  constructor(...loggers) {

    const properties = {

      [_muters]: {value: new Map()},
      [_options]: {value: new Map()},

      [_key]: {value: (logger, method) => {
          var loggerKey = this[_loggerKeys].get(logger);
          if (!loggerKey) {
            this[_loggerKeyCounter]++;
            loggerKey = `logger${this[_loggerKeyCounter]}`;
            this[_loggerKeys].set(logger, loggerKey);
          }
          return `${loggerKey}_${method}`;
        }},
      [_loggerKeys]: {value: new Map()},
      [_loggerKeyCounter]: {value: 0, writable: true},

      [_fullLogs]: {value: []},
      [_individualLogs]: {value: new Map()},
      [_listener]: {value: (args, muter) => {
          const key = this[_key](muter.logger, muter.method);
          const options = this[_options].get(key);
          const logs = this[_individualLogs].get(key);

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

          const log = {
            args, color, format, endString,
            boundOriginal: muter.boundOriginal
          };

          logs.push(log);

          this[_fullLogs].push(log);
        }},

      [_startListening]: {value: startListening},
      [_stopListening]: {value: stopListening},

      [_isListening]: {value: false, writable: true},
      isListening: {
        get() {
          return this[_isListening];
        },
        set(bool) {
          this[_isListening] = !!bool;
        }
      },

      isMuting: {
        get: makeGetter('muting')
      },
      isCapturing: {
        get: makeGetter('capturing')
      },
      isActivated: {
        get: makeGetter('activated')
      }

    };

    Object.defineProperties(this, properties);

    loggers.forEach(logger => {
      const key = this[_key](logger[0], logger[1]);

      var muter = this[_muters].get(key);

      if (muter) {
        throw new Error(`Interleaving same logger twice`);
      }

      muter = new SimpleMuter(logger[0], logger[1]);

      var options = logger[2];
      if (!options) {
        options = {};
      }

      this[_muters].set(key, muter);
      this[_options].set(key, {
        color: options.color,
        format: options.format,
        endString: options.endString
      });
      this[_individualLogs].set(key, []);
    });

  }

  mute() {
    if (this.isListening) {
      return;
    }
    this[_muters].forEach(muter => {
      muter.mute();
    });
    this[_startListening]();
  }

  capture() {
    if (this.isListening) {
      return;
    }
    this[_muters].forEach(muter => {
      muter.capture();
    });
    this[_startListening]();
  }

  unmute() {
    if (!this.isListening) {
      return;
    }
    this[_muters].forEach(muter => {
      if (muter.listenerCount('log') <= 1) {
        muter.unmute();
      }

      const key = this[_key](muter.logger, muter.method);
      this[_individualLogs].get(key).length = 0;
    });
    this[_fullLogs].length = 0;
    this[_stopListening]();
  }

  uncapture() {
    if (!this.isListening) {
      return;
    }
    this[_muters].forEach(muter => {
      if (muter.listenerCount('log') <= 1) {
        muter.uncapture();
      }

      const key = this[_key](muter.logger, muter.method);
      this[_individualLogs].get(key).length = 0;
    });
    this[_fullLogs].length = 0;
    this[_stopListening]();
  }

  repair(options = {mute: true}) {
    var mute = options.mute ? 'mute' : 'capture';
    var unmute = 'un' + mute;
    if (this.isListening) {
      this[_muters].forEach(muter => {
        muter[mute]();
      });
    } else {
      this[_muters].forEach(muter => {
        muter[unmute]();
      });
    }
  }

  getLogs(options = {}) {
    if (this.isActivated) {
      var logs;

      if (options.logger && options.method) {
        logs = this[_individualLogs].get(this[_key](options.logger,
          options.method));
      } else {
        logs = this[_fullLogs];
      }

      return logs.map(log => {
        let _color = options.color ? options.color : log.color;
        let format = options.format ? options.format : log.format;
        let endString = options.endString ? options.endString : log.endString;
        let message = format(...log.args) + endString;
        return _color ? chalk[_color](message) : message;
      }).join('');
    }
  }

  flush(options = {}) {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(options);

    this[_fullLogs].forEach(log => {
      log.boundOriginal(...log.args);
    });

    this[_fullLogs].length = 0;
    this[_muters].forEach(muter => {
      muter.forget();

      const key = this[_key](muter.logger, muter.method);
      this[_individualLogs].get(key).length = 0;
    });

    return logs;
  }

  forget() {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs();
    this[_fullLogs].length = 0;
    this[_muters].forEach(muter => {
      muter.forget();

      const key = this[_key](muter.logger, muter.method);
      this[_individualLogs].get(key).length = 0;
    });

    return logs;
  }

}

export default AdvancedMuter;
