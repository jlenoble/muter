import muterFactory from '../src/muter';

import {expect} from 'chai';

const logger = console;
const methods = ['log', 'warn', 'error'];

methods.forEach(method => {

  function unmute() {
    logger[method].restore && logger[method].restore();
    process.stdout && process.stdout.write.restore &&
      process.stdout.write.restore();
    process.stderr && process.stderr.write.restore &&
      process.stderr.write.restore();
  }

  const originalLoggingFunction = logger[method];

  describe(`Testing Muter factory with console.${method}:`, function() {

    const unmuteCallbackFactory = function(func) {
      // Wrapping Mocha callbacks is necessary due to the fact that these tests
      // interfere with Mocha's logs, so we undo output capturing before Mocha
      // reports its results
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
      expect(logger[method]).to.equal(originalLoggingFunction);

      this.muter = muterFactory(logger, method);
    });

    it(`A muter mutes console.${method} by calling 'mute'`,
      unmuteCallbackFactory(function() {
      this.muter.mute();

      expect(logger[method]).not.to.equal(originalLoggingFunction);
    }));

    it(`A muter unmutes console.${method} by calling 'unmute'`,
      unmuteCallbackFactory(function() {
      this.muter.mute();
      expect(logger[method]).not.to.equal(originalLoggingFunction);

      this.muter.unmute();
      expect(logger[method]).to.equal(originalLoggingFunction);
    }));

    it(`A muter returns muted messages of console.${method}` +
      ` by calling 'getLogs'`);

    it(`muter captures messages without muting console.${method}` +
      ` by calling 'capture'`);

    it(`A muter uncaptures console.${method}'s messages` +
      ` by calling 'uncapture'`);

    it(`Once unmuted, muter's method 'getLogs' returns nothing`);

  });

});
