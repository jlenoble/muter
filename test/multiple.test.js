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

describe(`Testing Muter concurrency:`, function() {

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

  before(function() {
    this.log = Muter(console, 'log');
    this.warn = Muter(console, 'warn');
    this.error = Muter(console, 'error');
  });

  it(`Can't mute console.log twice`, unmutedCallback(function() {
    this.log.mute();

    expect(this.log.mute).to.throw(TypeError,
      'Attempted to wrap log which is already wrapped');
    expect(this.log.capture).to.throw(TypeError,
      'Attempted to wrap log which is already wrapped');
  }));

  it(`Can unmute console.log multiple times`, unmutedCallback(function() {
    this.log.mute();

    expect(this.log.unmute).not.to.throw();
    expect(this.log.unmute).not.to.throw();
    expect(this.log.uncapture).not.to.throw();
  }));

  it(`A Muter is a singleton`, unmutedCallback(function() {
    ['log', 'warn', 'error'].forEach(name => {
      const muter = Muter(console, name);

      expect(muter).to.equal(this[name]);
    });
  }));

});
