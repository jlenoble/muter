import SimpleMuter from './simple-muter';

import chalk from 'chalk';

const _muters = Symbol();
const _options = Symbol();

const _key = Symbol();
const _loggerKeys = Symbol();
const _loggerKeyCounter = Symbol();

const _logs = Symbol();
const _listener = Symbol();

const _startListening = Symbol();
const _stopListening = Symbol();

function startListening() {
  this[_muters].forEach(muter => {
    muter.on('log', this[_listener]);
  });
}

function stopListening() {
  this[_muters].forEach(muter => {
    muter.removeListener('log', this[_listener]);
  });
}

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

      [_logs]: {value: []},
      [_listener]: {value: (args, muter) => {
          const key = this[_key](muter.logger, muter.method);
          var color = this[_options].get(key).color;
          if (!color) {
            color = muter.color;
          }

          this[_logs].push({
            args,
            format: muter.format,
            endString: muter.endString,
            boundOriginal: muter.boundOriginal,
            color,
            message: muter.format(...args) + muter.endString
          });
        }},

      [_startListening]: {value: startListening},
      [_stopListening]: {value: stopListening},

      isMuting: {
        get() {
          var muting;
          [...this[_muters].values()].forEach(muter => {
            if (muting === undefined) {
              muting = muter.isMuting;
            } else {
              if (muting !== muter.isMuting) {
                throw new Error(
`Muters referenced by advanced Muter have inconsistent muting state`);
              }
            }
          });
          return muting;
        }
      },
      isCapturing: {
        get() {
          var muting;
          [...this[_muters].values()].forEach(muter => {
            if (muting === undefined) {
              muting = muter.isCapturing;
            } else {
              if (muting !== muter.isCapturing) {
                throw new Error(
`Muters referenced by advanced Muter have inconsistent capturing state`);
              }
            }
          });
          return muting;
        }
      },
      isActivated: {
        get() {
          var muting;
          [...this[_muters].values()].forEach(muter => {
            if (muting === undefined) {
              muting = muter.isActivated;
            } else {
              if (muting !== muter.isActivated) {
                throw new Error(
`Muters referenced by advanced Muter have inconsistent activated state`);
              }
            }
          });
          return muting;
        }
      }

    };

    Object.defineProperties(this, properties);

    loggers.forEach(logger => {
      var muter = this[_muters].get(this[_key](logger[0], logger[1]));

      if (muter) {
        throw new Error(`Interleaving same logger twice`);
      }

      muter = new SimpleMuter(
        logger[0], logger[1], logger[2]
      );

      var options = logger[2];
      if (!options) {
        options = {};
      }

      this[_muters].set(this[_key](logger[0], logger[1]), muter);
      this[_options].set(this[_key](logger[0], logger[1]), {
        color: options.color
      });
    });

  }

  mute() {
    this[_muters].forEach(muter => {
      muter.mute();
    });
    this[_startListening]();
  }

  capture() {
    this[_muters].forEach(muter => {
      muter.capture();
    });
    this[_startListening]();
  }

  unmute() {
    this[_muters].forEach(muter => {
      muter.unmute();
    });
    this[_logs].length = 0;
    this[_stopListening]();
  }

  uncapture() {
    this[_muters].forEach(muter => {
      muter.uncapture();
    });
    this[_logs].length = 0;
    this[_stopListening]();
  }

  getLogs(color) {
    if (this.isActivated) {
      return this[_logs].map(log => {
        let _color = color ? color : log.color;
        return _color ? chalk[_color](log.message) : log.message;
      }).join('');
    }
  }

  flush(color) {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(color);

    this[_logs].forEach(log => {
      log.boundOriginal(...log.args);
    });

    this[_logs].length = 0;
    this[_muters].forEach(muter => {
      muter.forget();
    });

    return logs;
  }

  forget() {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(color);
    this[_logs].length = 0;
    this[_muters].forEach(muter => {
      muter.forget();
    });

    return logs;
  }

}

export default AdvancedMuter;
