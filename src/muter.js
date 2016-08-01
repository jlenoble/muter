import sinon from 'sinon';

function muterFactory(logger = console, method = 'log') {

  const usesStdout = process.stdout && logger === console &&
    (method === 'log' || method === 'info');
  const usesStderr = process.stderr && logger === console &&
    (method === 'warn' || method === 'error');

  return {

    mute() {
      this.unmute();

      sinon.stub(logger, method);

      if (usesStdout) {
        // Silence also process.stdout for full muting.
        sinon.stub(process.stdout, 'write');
      }

      if (usesStderr) {
        // Silence also process.stderr for full muting.
        sinon.stub(process.stderr, 'write');
      }
    },

    unmute() {
      if (logger[method].restore) {logger[method].restore();}

      if (usesStdout && process.stdout.write.restore) {
        process.stdout.write.restore();
      }

      if (usesStderr && process.stderr.write.restore) {
        process.stderr.write.restore();
      }
    },

    getLogs(color) {
      if (logger[method].restore) {
        var calls = logger[method].getCalls();

        calls = calls.map(call => {
          return call.args.join(' ');
        });

        calls = calls.join('\n');

        return color ? chalk[color](calls) : calls;
      }
    }

  };

}

export default muterFactory;
