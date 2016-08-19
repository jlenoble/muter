import sinon from 'sinon';
import chalk from 'chalk';
import util from 'util';

var muters = new Map();

function Muter(logger, method, format = util.format) {

  var muter = muters.get(logger[method]);

  if (muter) {
    return muter;
  }

  function unmute() {
    if (logger[method].restore) {logger[method].restore();}
  }

  const _isMuting = Symbol();
  const _isCapturing = Symbol();

  muter = {

    [_isMuting]: false,
    [_isCapturing]: false,

    mute() {
      if (this.isActivated) {
        throw new Error(`Muter is already activated, don't call 'mute'`);
      }

      this.isMuting = true;

      sinon.stub(logger, method);
    },

    unmute() {
      unmute();
      this.isMuting = false;
    },

    getLogs(color) {
      if (this.isActivated) {
        var calls = logger[method].getCalls();

        calls = calls.map(call => {
          return format(...call.args);
        });

        calls = calls.join('\n');

        return color ? chalk[color](calls) : calls;
      }
    },

    capture() {
      if (this.isActivated) {
        throw new Error(`Muter is already activated, don't call 'capture'`);
      }

      this.isCapturing = true;

      sinon.stub(logger, method, logger[method]);
    },

    uncapture() {
      unmute();
      this.isCapturing = false;
    },

    flush(color) {
      if (!this.isActivated) {
        return;
      }

      const logs = this.getLogs(color);
      unmute();
      logger[method](logs);

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

  };

  Object.defineProperties(muter, {
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
  });

  muters.set(logger[method], muter);

  return muter;

}

export default Muter;
