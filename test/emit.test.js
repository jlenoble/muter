import Muter from '../src/muter';

import {expect} from 'chai';

const listener = (args) => {
  console.info('Caught:', ...args);
};

function unmute() {
  console.log.restore && console.log.restore();
  console.info.restore && console.info.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();
}

describe('Testing events in Muter:', function() {

  const unmutedCallback = function(func) {
    // Wrapping Mocha callbacks is necessary due to the fact that these tests
    // interfere with Mocha's logs, so we undo output capturing before Mocha
    // reports its results (and can't use 'after' as 'it' messages are
    // output right away)
    return function() {
      try {
        func.call(this);

        // Listeners might not be removed properly and events could bleed
        // on every test thereafter, so force removal no matter what
        this.log.removeListener('log', listener);

        // Mocha shouldn't output a message if test passes since
        // stdout/stderr is muted, so unmute before leaving
        unmute();
      } catch (e) {
        // Listeners might not be removed properly and events could bleed
        // on every test thereafter, so force removal no matter what
        this.log.removeListener('log', listener);

        // In order for Mocha to print all info when failing, unmute before
        // rethrowing
        unmute();

        throw e;
      }
    };
  };

  before(function() {
    this.log = Muter(console, 'log');
    this.info = Muter(console, 'info');
    this.warn = Muter(console, 'warn');
    this.error = Muter(console, 'error');
  });

  it('Muted Muter emits on log', unmutedCallback(function() {

    this.info.mute();

    this.log.addListener('log', listener);
    this.log.mute();

    console.log('Message 1');
    console.log('Message 2');

    expect(this.log.getLogs()).to.equal(`Message 1
Message 2`);

    this.log.removeListener('log', listener);
    this.log.unmute();

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.info.getLogs()).to.equal(`Caught: Message 1
Caught: Message 2`);

    this.info.unmute();

    expect(this.info.getLogs()).to.be.undefined;
  }));

  it('Captured Muter emits on log', unmutedCallback(function() {

    this.info.mute();

    this.log.addListener('log', listener);
    this.log.capture();

    console.log('Captured message 1');
    console.log('Captured message 2');

    expect(this.log.getLogs()).to.equal(`Captured message 1
Captured message 2`);

    this.log.removeListener('log', listener);
    this.log.unmute();

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.info.getLogs()).to.equal(`Caught: Captured message 1
Caught: Captured message 2`);

    this.info.unmute();

    expect(this.info.getLogs()).to.be.undefined;
  }));

});
