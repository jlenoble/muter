import SimpleMuter from './simple-muter';

const _muters = Symbol();
const _messages = Symbol();
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
      [_messages]: {value: []},
      [_listener]: {value: (args, format, endString) => {
          this[_messages].push(format(...args) + endString);
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
    this[_messages].length = 0;
    this[_stopListening]();
  }

  uncapture() {
    this[_muters].forEach(muter => {
      muter.uncapture();
    });
    this[_messages].length = 0;
    this[_stopListening]();
  }

  getLogs(color) {
    if (this[_messages].length) {
      return this[_messages].join('');
    }
  }

  flush(color) {

  }

}

export default AdvancedMuter;
