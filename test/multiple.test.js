import Muter from '../src/muter';

import {expect} from 'chai';

function unmute() {
  console.log.restore && console.log.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();
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

    expect(this.log.mute.bind(this.log)).to.throw(Error,
      `Muter is already activated, don't call 'mute'`);
    expect(this.log.capture.bind(this.log)).to.throw(Error,
      `Muter is already activated, don't call 'capture'`);
  }));

  it(`Can unmute console.log multiple times`, unmutedCallback(function() {
    this.log.mute();

    expect(this.log.unmute.bind(this.log)).not.to.throw();
    expect(this.log.unmute.bind(this.log)).not.to.throw();
    expect(this.log.uncapture.bind(this.log)).not.to.throw();
  }));

  it(`A Muter is a singleton`, unmutedCallback(function() {
    ['log', 'warn', 'error'].forEach(name => {
      const muter = Muter(console, name);

      expect(muter).to.equal(this[name]);
    });
  }));

  it(`console.log and console.error don't interfere`, unmutedCallback(
  function() {
    this.log.mute();

    console.log('Test console.log, should be muted');
    console.error('Test console.error, should be unmuted');

    expect(this.log.getLogs()).to.equal('Test console.log, should be muted');
    expect(this.error.getLogs()).to.be.undefined;

    this.error.mute();

    console.log('Test console.log 2, should be muted');
    console.error('Test console.error 2, should be muted');

    expect(this.log.getLogs()).to.equal(`Test console.log, should be muted
Test console.log 2, should be muted`);
    expect(this.error.getLogs()).to.equal(
      'Test console.error 2, should be muted');

    this.log.unmute();

    console.log('Test console.log 3, should be unmuted');
    console.error('Test console.error 3, should be muted');

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted`);

    this.log.capture();

    console.log('Test console.log 4, should be captured');
    console.error('Test console.error 4, should be muted');

    expect(this.log.getLogs()).to.equal(
      'Test console.log 4, should be captured');
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
Test console.error 4, should be muted`);
  }));

  it(`console.warn and console.error don't interfere`, unmutedCallback(
  function() {
    this.warn.mute();

    console.warn('Test console.warn, should be muted');
    console.error('Test console.error, should be unmuted');

    expect(this.warn.getLogs()).to.equal('Test console.warn, should be muted');
    expect(this.error.getLogs()).to.be.undefined;

    this.error.mute();

    console.warn('Test console.warn 2, should be muted');
    console.error('Test console.error 2, should be muted');

    expect(this.warn.getLogs()).to.equal(`Test console.warn, should be muted
Test console.warn 2, should be muted`);
    expect(this.error.getLogs()).to.equal(
      'Test console.error 2, should be muted');

    this.warn.unmute();

    console.warn('Test console.warn 3, should be unmuted');
    console.error('Test console.error 3, should be muted');

    expect(this.warn.getLogs()).to.be.undefined;
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted`);

    this.warn.capture();

    console.warn('Test console.warn 4, should be captured');
    console.error('Test console.error 4, should be muted');

    expect(this.warn.getLogs()).to.equal(
      'Test console.warn 4, should be captured');
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
Test console.error 4, should be muted`);
  }));

});
