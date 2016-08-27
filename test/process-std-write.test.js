import Muter from '../src/muter';
import {unmutedCallback} from './helpers.help';

import {expect} from 'chai';

const logger = process.stdout;
const method = 'write';

const originalLoggingFunction = logger[method];

describe(`Testing Muter factory with process.stdout.write:`, function() {

  before(function() {
    expect(logger[method]).to.equal(originalLoggingFunction);

    this.muter = Muter(logger, method);
  });

  it(`A muter mutes process.stdout.write by calling 'mute'`,
    unmutedCallback(function() {
    this.muter.mute();

    expect(logger[method]).not.to.equal(originalLoggingFunction);
  }));

  it(`A muter unmutes process.stdout.write by calling 'unmute'`,
    unmutedCallback(function() {
    this.muter.mute();
    expect(logger[method]).not.to.equal(originalLoggingFunction);

    this.muter.unmute();
    expect(logger[method]).to.equal(originalLoggingFunction);
  }));

  it(`A muter returns muted messages of process.stdout.write` +
    ` by calling 'getLogs'`, unmutedCallback(function() {
    this.muter.mute();

    logger[method]('Hello');
    logger[method]('World!');

    expect(this.muter.getLogs()).to.equal(`HelloWorld!`);
  }));

  it(`Once unmuted, muter's method 'getLogs' returns nothing`,
    unmutedCallback(function() {
    this.muter.mute();

    logger[method]('Hello');
    logger[method]('World!');

    expect(this.muter.getLogs()).to.equal(`HelloWorld!`);

    this.muter.unmute();

    expect(this.muter.getLogs()).to.be.undefined;
  }));

  it(`Testing various args for process.stdout.write`,
    unmutedCallback(function() {
    // 2 args
    this.muter.mute();

    logger[method]('Hello', 'World!');

    expect(this.muter.getLogs()).to.equal('Hello');

    this.muter.unmute();

    expect(this.muter.getLogs()).to.be.undefined;

    // Formatted args
    this.muter.mute();

    logger[method]('%s Mr %s', 'Hello', 'World!');

    expect(this.muter.getLogs()).to.equal('%s Mr %s');

    this.muter.unmute();

    expect(this.muter.getLogs()).to.be.undefined;

    // Error object
    this.muter.mute();

    const error = new Error('Controlled test error');
    logger[method](error);

    expect(this.muter.getLogs()).to.equal(error.toString());
  }));

  it(`A muter captures messages without muting process.stdout.write` +
    ` by calling 'capture'`, unmutedCallback(function() {
    this.muter.capture();

    expect(logger[method]).not.to.equal(originalLoggingFunction);

    logger[method](
      'This is an unmuted test message that should be captured by muter');
    logger[method]('And this is a second unmuted test message');

    expect(this.muter.getLogs()).to.equal(
      `This is an unmuted test message that should be captured by muter` +
      `And this is a second unmuted test message`);
  }));

  it(`A muter uncaptures process.stdout.write's messages` +
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
      `This is a muted test message that should be flushed by muter` +
      `And this is a second muted and flushed test message`);

    logger[method]('And this is a third muted and flushed test message');

    expect(this.muter.flush()).to.equal(
      `And this is a third muted and flushed test message`);
  }));

  it(`Concurrency between stdout and stderr`, unmutedCallback(function() {
    expect(process.stdout.write).to.equal(process.stderr.write);

    this.muter.mute();
    const muter = Muter(process.stderr, 'write');
    muter.mute();

    expect(process.stdout.write).not.to.equal(process.stderr.write);

    process.stdout.write('out1');
    process.stderr.write('err1');
    process.stderr.write('err2');
    process.stdout.write('out2');

    expect(this.muter.getLogs()).to.equal('out1out2');
    expect(muter.getLogs()).to.equal('err1err2');

    this.muter.unmute();
    muter.unmute();

    expect(this.muter.getLogs()).to.be.undefined;
    expect(muter.getLogs()).to.be.undefined;

    expect(process.stdout.write).to.equal(process.stderr.write);
  }));

});
