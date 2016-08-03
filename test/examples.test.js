import Muter from '../src/muter';

import {expect} from 'chai';

function unmute() {
  console.log.restore && console.log.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();

  process.stdout && process.stdout.write.restore &&
    process.stdout.write.restore();
  process.stderr && process.stderr.write.restore &&
    process.stderr.write.restore();
}

const originalLoggingFunctions = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

describe(`Testing README.md examples:`, function() {

  const unmutedCallback = function(func) {
    // Wrapping Mocha callbacks is necessary due to the fact that these tests
    // interfere with Mocha's logs, so we undo output capturing before Mocha
    // reports its results (and can't use 'after' as 'it' messages are
    // output right away)
    return function() {
      try {
        func.call(this);

        // Mocha shouldn't output a message if test passes since
        // stdout/stderr is muted, so unmute before leaving
        unmute();
      } catch (e) {
        // In order for Mocha to print all info when failing, unmute before
        // rethrowing
        unmute();

        throw e;
      }
    };
  };

  it(`README.md usage example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'error');

    muter.mute(); // console.error outputs nothing anymore
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    console.error('Test message'); // This message should not be printed
    expect(muter.getLogs()).to.equal('Test message');

    console.log(muter.getLogs('red'), ': expected and printed in red');
    // Should print on stdout 'Test message' in red and ': expected and
    // printed in red' in default color

    muter.unmute(); // Restores console.error to default behavior
    expect(console.error).to.equal(originalLoggingFunctions.error);

    console.log(muter.getLogs('red'),
      'undefined expected and printed in default color');
    // Should print on stdout 'undefined' and 'undefined expected and
    // printed in default color', all in default color

    muter.capture(); // stderr will still outputs logs
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    console.error('Another test message'); // This message should be
    // printed in default color
    expect(muter.getLogs()).to.equal('Another test message');

    console.log(muter.getLogs('red'),
      ': expected twice, first in default color, second in red');
    // Should print on stdout 'Another test message' in red and
    // ': expected twice, first in default color, second in red'

    muter.uncapture(); // Restores console.error to default behavior
    expect(console.error).to.equal(originalLoggingFunctions.error);

    console.log(muter.getLogs('red'),
      'undefined expected and printed in default color');
    // Should print on stdout 'undefined' and 'undefined expected and
    // printed in default color', all in default color
  }));

  it('README.md format example works fine', unmutedCallback(function() {
    const muter = Muter(console, 'error');

    muter.mute();
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    for (let i = 1; i < 4; i++) {
      console.error('%d) %s', i, 'Cute test message ' + i);
      // Prints nothing
    }

    console.log(muter.getLogs());
    // Prints:
    // 1) Cute test message 1
    // 2) Cute test message 2
    // 3) Cute test message 3
    expect(muter.getLogs()).to.equal(`1) Cute test message 1
2) Cute test message 2
3) Cute test message 3`);

    muter.unmute();
    expect(console.error).to.equal(originalLoggingFunctions.error);
  }));

});
