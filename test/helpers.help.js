import Muter from '../src/muter';

const originalLoggingFunctions = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

function unmute() {
  console.log.restore && console.log.restore();
  console.info.restore && console.info.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();
  process.stdout && process.stdout.write.restore &&
    process.stdout.write.restore();
  process.stderr && process.stderr.write.restore &&
    process.stderr.write.restore();
}

function removeListeners() {
  ['log', 'info', 'warn', 'error'].forEach(method => {
    if (this[method]) {
      this[method].removeAllListeners();
    }
  });

  ['stdout', 'stderr'].forEach(std => {
    if (this[std]) {
      this[std].removeAllListeners();
    }
  });
}

function unmutedCallback(func) {
  // Wrapping Mocha callbacks is necessary due to the fact that these tests
  // interfere with Mocha's logs, so we undo output capturing before Mocha
  // reports its results (and can't use 'after' as 'it' messages are
  // output right away)
  return function() {
    try {
      func.call(this);

      // Make sure there won't be any memory leak from test to test
      removeListeners.call(this);

      // Mocha shouldn't output a message if test passes since
      // stdout/stderr is muted, so unmute before leaving
      unmute();
    } catch (e) {
      // Make sure there won't be any memory leak from test to test
      removeListeners.call(this);

      // In order for Mocha to print all info when failing, unmute before
      // rethrowing
      unmute();

      throw e;
    }
  };
};

function presetLoggers() {
  this.consoleMethods = ['log', 'info', 'warn','error'];
  this.stds = ['stdout', 'stderr'];

  this.consoleMethods.forEach(method => {
    this[method] = Muter(console, method);
  });
  this.stds.forEach(std => {
    this[std] = Muter(process[std], 'write');
  });
}

export {originalLoggingFunctions, unmute, removeListeners, unmutedCallback,
  presetLoggers};
