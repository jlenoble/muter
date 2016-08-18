import sinon from 'sinon';
import chalk from 'chalk';
import util from 'util';

var muters = new Map();

function Muter(logger, method) {

  var muter = muters.get(logger[method]);

  if (muter) {
    return muter;
  }

  const usesStdout = process.stdout && logger === console &&
    (method === 'log' || method === 'info');
  const usesStderr = process.stderr && logger === console &&
    (method === 'warn' || method === 'error');

  function unmute() {
    if (logger[method].restore) {logger[method].restore();}

    if (usesStdout && process.stdout.write.restore) {
      process.stdout.write.restore();
    }

    if (usesStderr && process.stderr.write.restore) {
      process.stderr.write.restore();
    }
  }

  const _isMuting = Symbol();
  const _isCapturing = Symbol();

  muter = {

    [_isMuting]: false,
    [_isCapturing]: false,

    mute(options = {
      muteProcessStdout: false,
      muteProcessStderr: false
    }) {
      if (this.isActivated) {
        throw new Error(`Muter is already activated, don't call 'mute'`);
      }

      this.isMuting = true;

      sinon.stub(logger, method);

      if (options.muteProcessStdout) {
        // Silence also process.stdout for full muting.
        sinon.stub(process.stdout, 'write');
      } else if (options.muteProcessStderr) {
        // Silence also process.stderr for full muting.
        sinon.stub(process.stderr, 'write');
      }
    },

    unmute() {
      unmute();
      this.isMuting = false;
    },

    getLogs(color) {
      if (this.isActivated) {
        var calls = logger[method].getCalls();

        calls = calls.map(call => {
          return util.format(...call.args);
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

      if (usesStdout) {
        sinon.stub(logger, method, function(...args) {
          return process.stdout.write(util.format(...args) + '\n');
        });
      } else if (usesStderr) {
        sinon.stub(logger, method, function(...args) {
          return process.stderr.write(util.format(...args) + '\n');
        });
      }
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
