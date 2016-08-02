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
      expect(logger[method]).to.equal(originalLoggingFunction);

      this.muter = muterFactory(logger, method);
    });

    it(`A muter mutes console.${method} by calling 'mute'`,
      unmutedCallback(function() {
      this.muter.mute();

      expect(logger[method]).not.to.equal(originalLoggingFunction);
    }));

    it(`A muter unmutes console.${method} by calling 'unmute'`,
      unmutedCallback(function() {
      this.muter.mute();
      expect(logger[method]).not.to.equal(originalLoggingFunction);

      this.muter.unmute();
      expect(logger[method]).to.equal(originalLoggingFunction);
    }));

    it(`A muter returns muted messages of console.${method}` +
      ` by calling 'getLogs'`, unmutedCallback(function() {
      this.muter.mute();

      logger[method]('Hello');
      logger[method]('World!');

      expect(this.muter.getLogs()).to.equal(`Hello
World!`);
    }));

    it(`Once unmuted, muter's method 'getLogs' returns nothing`,
      unmutedCallback(function() {
      this.muter.mute();

      logger[method]('Hello');
      logger[method]('World!');

      expect(this.muter.getLogs()).to.equal(`Hello
World!`);

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;
    }));

    it(`Testing various args for console.${method}`,
      unmutedCallback(function() {
      // 2 args
      this.muter.mute();

      logger[method]('Hello', 'World!');

      expect(this.muter.getLogs()).to.equal('Hello World!');

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;

      // Formatted args
      this.muter.mute();

      logger[method]('%s Mr %s', 'Hello', 'World!');

      expect(this.muter.getLogs()).to.equal('Hello Mr World!');

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;

      // Error object
      this.muter.mute();

      const error = new Error('Controlled test error');
      logger[method](error);

      expect(this.muter.getLogs()).to.equal(error.stack);
    }));

    it(`muter captures messages without muting console.${method}` +
      ` by calling 'capture'`, unmutedCallback(function() {
      this.muter.capture();

      expect(logger[method]).not.to.equal(originalLoggingFunction);

      logger[method](
        'This is an unmuted test message that should be captured by muter');
      logger[method]('And this is a second unmuted test message');

      expect(this.muter.getLogs()).to.equal(
        `This is an unmuted test message that should be captured by muter
And this is a second unmuted test message`);
    }));

    it(`A muter uncaptures console.${method}'s messages` +
      ` by calling 'uncapture'`, unmutedCallback(function() {
      this.muter.capture();
      expect(logger[method]).not.to.equal(originalLoggingFunction);

      this.muter.uncapture();
      expect(logger[method]).to.equal(originalLoggingFunction);
    }));

    if (logger === console && method === 'error') {
      it(`README.md usage example works fine`, unmutedCallback(function() {
        this.muter.mute(); // console.error outputs nothing anymore
        expect(logger[method]).not.to.equal(originalLoggingFunction);

        console.error('Test message'); // This message should not be printed
        expect(this.muter.getLogs()).to.equal('Test message');

        console.log(this.muter.getLogs('red'), ': expected and printed in red');
        // Should print on stdout 'Test message' in red and ': expected and
        // printed in red' in default color

        this.muter.unmute(); // Restores console.error to default behavior
        expect(logger[method]).to.equal(originalLoggingFunction);

        console.log(this.muter.getLogs('red'),
          'undefined expected and printed in default color');
        // Should print on stdout 'undefined' and 'undefined expected and
        // printed in default color', all in default color

        this.muter.capture(); // stderr will still outputs logs
        expect(logger[method]).not.to.equal(originalLoggingFunction);

        console.error('Another test message'); // This message should be
        // printed in default color
        expect(this.muter.getLogs()).to.equal('Another test message');

        console.log(this.muter.getLogs('red'),
          ': expected twice, first in default color, second in red');
        // Should print on stdout 'Another test message' in red and
        // ': expected twice, first in default color, second in red'

        this.muter.uncapture(); // Restores console.error to default behavior
        expect(logger[method]).to.equal(originalLoggingFunction);

        console.log(this.muter.getLogs('red'),
          'undefined expected and printed in default color');
        // Should print on stdout 'undefined' and 'undefined expected and
        // printed in default color', all in default color
      }));

      it('README.md format example works fine', unmutedCallback(function() {
        this.muter.mute();
        expect(logger[method]).not.to.equal(originalLoggingFunction);

        for (let i = 1; i < 4; i++) {
          console.error('%d) %s', i, 'Cute test message ' + i);
          // Prints nothing
        }

        console.log(this.muter.getLogs());
        // Prints:
        // 1) Cute test message 1
        // 2) Cute test message 2
        // 3) Cute test message 3
        expect(this.muter.getLogs()).to.equal(`1) Cute test message 1
2) Cute test message 2
3) Cute test message 3`);

        this.muter.unmute();
        expect(logger[method]).to.equal(originalLoggingFunction);
      }));
    }

  });

});
