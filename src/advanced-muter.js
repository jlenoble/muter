import SimpleMuter from './simple-muter';

const _muters = Symbol();
const _messages = Symbol();
const _listener = Symbol();

class AdvancedMuter {

  constructor(...loggers) {

    this[_muters] = new Map();
    this[_messages] = [];
    this[_listener] = (args, format, endString) => {
      this[_messages].push(format(...args) + endString);
    };

    loggers.forEach(logger => {
      var muter = this[_muters].get(logger[0][logger[1]]);
      if (!muter) {
        muter = new SimpleMuter(
          logger[0], logger[1], logger[2]
        );
        this[_muters].set(logger[0][logger[1]], muter);
        muter.on('log', this[_listener]);
      } else {
        throw new Error('Interleaving same logger twice: ' + logger);
      }
    });

  }

  mute() {
    this[_muters].forEach(muter => {
      muter.mute();
    });
  }

  capture() {
    this[_muters].forEach(muter => {
      muter.capture();
    });
  }

  unmute() {
    this[_muters].forEach(muter => {
      muter.unmute();
    });
  }

  uncapture() {
    this[_muters].forEach(muter => {
      muter.uncapture();
    });
  }

  getLogs(color) {
    const message = this[_messages].join('');
    if (message) {
      return message;
    }
  }

  flush(color) {
    
  }

}

export default AdvancedMuter;
