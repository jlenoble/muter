import sinon from 'sinon';
import chalk from 'chalk';
import util from 'util';

var muters = new Map();

function Muter(logger = console, method = 'log') {

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

  muter = {

    mute() {
      sinon.stub(logger, method);

      if (usesStdout && !process.stdout.write.restore) {
        // Silence also process.stdout for full muting.
        sinon.stub(process.stdout, 'write');
      } else if (usesStderr && !process.stderr.write.restore) {
        // Silence also process.stderr for full muting.
        sinon.stub(process.stderr, 'write');
      }
    },

    unmute() {
      unmute();
    },

    getLogs(color) {
      if (logger[method].restore) {
        var calls = logger[method].getCalls();

        calls = calls.map(call => {
          return util.format(...call.args);
        });

        calls = calls.join('\n');

        return color ? chalk[color](calls) : calls;
      }
    },

    capture() {
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
    }

  };

  muters.set(logger[method], muter);

  return muter;

}

export default Muter;
