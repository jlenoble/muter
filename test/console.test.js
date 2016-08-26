import Muter from '../src/muter';
import {unmutedCallback} from './helpers.help';

import {expect} from 'chai';
import chalk from 'chalk';

const logger = console;
const methods = ['log', 'warn', 'error'];

methods.forEach(method => {

  const originalLoggingFunction = logger[method];

  describe(`Testing Muter factory with console.${method}:`, function() {

    before(function() {
      expect(logger[method]).to.equal(originalLoggingFunction);

      this.muter = Muter(logger, method);
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

      expect(this.muter.getLogs()).to.equal(`Hello\nWorld!\n`);
    }));

    it(`Once unmuted, muter's method 'getLogs' returns nothing`,
      unmutedCallback(function() {
      this.muter.mute();

      logger[method]('Hello');
      logger[method]('World!');

      expect(this.muter.getLogs()).to.equal(`Hello\nWorld!\n`);

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;
    }));

    it(`Testing various args for console.${method}`,
      unmutedCallback(function() {
      // 2 args
      this.muter.mute();

      logger[method]('Hello', 'World!');

      expect(this.muter.getLogs()).to.equal('Hello World!\n');

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;

      // Formatted args
      this.muter.mute();

      logger[method]('%s Mr %s', 'Hello', 'World!');

      expect(this.muter.getLogs()).to.equal('Hello Mr World!\n');

      this.muter.unmute();

      expect(this.muter.getLogs()).to.be.undefined;

      // Error object
      this.muter.mute();

      const error = new Error('Controlled test error');
      logger[method](error);

      expect(this.muter.getLogs()).to.equal(error.stack + '\n');
    }));

    it(`A muter captures messages without muting console.${method}` +
      ` by calling 'capture'`, unmutedCallback(function() {
      this.muter.capture();

      expect(logger[method]).not.to.equal(originalLoggingFunction);

      logger[method](
        'This is an unmuted test message that should be captured by muter');
      logger[method]('And this is a second unmuted test message');

      expect(this.muter.getLogs()).to.equal(
        `This is an unmuted test message that should be captured by muter
And this is a second unmuted test message
`);
    }));

    it(`A muter uncaptures console.${method}'s messages` +
      ` by calling 'uncapture'`, unmutedCallback(function() {
      this.muter.capture();
      expect(logger[method]).not.to.equal(originalLoggingFunction);

      this.muter.uncapture();
      expect(logger[method]).to.equal(originalLoggingFunction);
    }));

    it(`A muter flushes messages by calling 'flush'`,
    unmutedCallback(function() {
      this.muter.mute();

      expect(logger[method]).not.to.equal(originalLoggingFunction);

      logger[method](
        'This is a muted test message that should be flushed by muter');
      logger[method]('And this is a second muted and flushed test message');

      expect(this.muter.flush()).to.equal(
        `This is a muted test message that should be flushed by muter
And this is a second muted and flushed test message
`);

      logger[method]('And this is a third muted and flushed test message');

      expect(this.muter.flush()).to.equal(
        `And this is a third muted and flushed test message\n`);

      expect(this.muter.flush()).to.equal('');
    }));

    it(`The Nth message can be accessed by calling 'getLog'`,
    unmutedCallback(function() {
      this.muter.mute();

      logger[method]('message1');
      logger[method]('message2');
      logger[method]('message3');

      expect(this.muter.getLog(0)).to.equal('message1\n');
      expect(this.muter.getLog(1, 'blue')).to.equal(chalk.blue('message2\n'));
      expect(this.muter.getLog(2, 'red')).to.equal(chalk.red('message3\n'));
    }));

    it(`A muter can print all or individual messages (without flushing)`,
    unmutedCallback(function() {
      this.muter.mute();
      const muter = Muter(process[method === 'log' ? 'stdout' : 'stderr'],
        'write');
      muter.mute();

      logger[method]('message1');
      logger[method]('message2');
      logger[method]('message3');

      this.muter.print(1);
      this.muter.print();

      expect(muter.getLogs()).to.equal(`message2
message1
message2
message3
`);

      muter.unmute();
    }));

    it(`A muter can forget all messages (without printing)`,
    unmutedCallback(function() {
      this.muter.mute();

      logger[method]('message1');
      logger[method]('message2');
      logger[method]('message3');

      expect(this.muter.forget()).to.equal(`message1
message2
message3
`);
      expect(this.muter.getLogs()).to.equal('');
      expect(this.muter.forget()).to.equal('');

      logger[method]('message4');

      expect(this.muter.getLogs()).to.equal('message4\n');
      expect(this.muter.forget()).to.equal('message4\n');
      expect(this.muter.getLogs()).to.equal('');
      expect(this.muter.forget()).to.equal('');
    }));

  });

});
