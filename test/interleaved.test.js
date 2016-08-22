import Muter from '../src/muter';

import {expect} from 'chai';

function unmute() {
  console.log.restore && console.log.restore();
  console.info.restore && console.info.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();
}

function removeListeners() {
  ['log', 'info', 'warn', 'error'].forEach(method => {
    if (this[method]) {
      this[method].removeListener('log', this.listener);
    }
  });
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

  before(function() {
    this.methods = ['info', 'warn','error'];
    this.methods.forEach(method => {
      this[method] = Muter(console, method);
    });

    this.randomMethod = () => {
      const n = Math.floor(this.methods.length * Math.random());
      return this.methods[n];
    };

    this.nTests = 10;
  });

  for (let j = 0; j < 2; j++) {

    it('console loggers can be interleaved, run ${j + 1}',
    unmutedCallback(function() {
      this.methods.forEach(method => {
        this[method].mute();
      });

      var methods = [];
      var message = '';
      var messages = [];
      this.listener = args => {
        messages.push(args.join(' '));
      };

      this.methods.forEach(method => {
        this[method].on('log', this.listener);
      });

      for (let i = 0; i < this.nTests; i++) {
        let method = this.randomMethod();
        methods.push(method);
        console[method](method + i);
        message += method + i;
      }

      expect(messages.join('')).to.equal(message);
      this.methods.forEach(method => {
        expect(this[method].listenerCount('log')).to.equal(1);
        // We don't remove listeners and count on unmutedCallback to clean up
        // Next identical test in the loop must work or there is a memory leak
        // due to zombie listeners
      });
    }));

  }

});
