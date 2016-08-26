import SimpleMuter from './simple-muter';

const _muters = Symbol();
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
      [_logs]: {value: []},
      [_listener]: {value: (args, format, endString, boundOriginal) => {
          this[_logs].push({
            boundOriginal, args,
            message: format(...args) + endString
          });
        }},
      [_startListening]: {value: startListening},
      [_stopListening]: {value: stopListening},

      isMuting: {
        get() {
          return [...this[_muters].values()].every(muter => muter.isMuting);
        }
      },
      isCapturing: {
        get() {
          return [...this[_muters].values()].every(muter => muter.isCapturing);
        }
      },
      isActivated: {
        get() {
          return [...this[_muters].values()].every(muter => muter.isActivated);
        }
      }

    };

    Object.defineProperties(this, properties);

    loggers.forEach(logger => {
      var muter = this[_muters].get(logger[0][logger[1]]);
      if (!muter) {
        muter = new SimpleMuter(
          logger[0], logger[1], logger[2]
        );
        this[_muters].set(logger[0][logger[1]], muter);
      } else {
        throw new Error(
          `Interleaving same logger twice`);
      }
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
      return this[_logs].map(log => log.message).join('');
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
