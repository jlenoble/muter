import Muter from '../src/muter';
import {unmutedCallback, presetLoggers} from './helpers.help';

import {expect} from 'chai';

describe(`Testing Muter concurrency:`, function() {

  before(presetLoggers);

  it(`Muting console.log twice has no effect`, unmutedCallback(function() {
    this.log.mute();

    const log = console.log;

    expect(this.log.mute.bind(this.log)).not.to.throw();
    expect(console.log).to.equal(log);
  }));

  it(`Can unmute console.log multiple times`, unmutedCallback(function() {
    this.log.mute();

    expect(this.log.unmute.bind(this.log)).not.to.throw();
    expect(this.log.unmute.bind(this.log)).not.to.throw();
    expect(this.log.uncapture.bind(this.log)).not.to.throw();
  }));

  it(`A Muter is a singleton`, unmutedCallback(function() {
    ['log', 'info', 'warn', 'error'].forEach(name => {
      const muter = Muter(console, name);

      expect(muter).to.equal(this[name]);
    });
  }));

  it(`console.log and console.error don't interfere`, unmutedCallback(
  function() {
    this.log.mute();

    console.log('Test console.log, should be muted');
    console.error('Test console.error, should be unmuted');

    expect(this.log.getLogs()).to.equal('Test console.log, should be muted\n');
    expect(this.error.getLogs()).to.be.undefined;

    this.error.mute();

    console.log('Test console.log 2, should be muted');
    console.error('Test console.error 2, should be muted');

    expect(this.log.getLogs()).to.equal(`Test console.log, should be muted
Test console.log 2, should be muted
`);
    expect(this.error.getLogs()).to.equal(
      'Test console.error 2, should be muted\n');

    this.log.unmute();

    console.log('Test console.log 3, should be unmuted');
    console.error('Test console.error 3, should be muted');

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
`);

    this.log.capture();

    console.log('Test console.log 4, should be captured');
    console.error('Test console.error 4, should be muted');

    expect(this.log.getLogs()).to.equal(
      'Test console.log 4, should be captured\n');
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
Test console.error 4, should be muted
`);
  }));

  it(`console.warn and console.error don't interfere`, unmutedCallback(
  function() {
    this.warn.mute();

    console.warn('Test console.warn, should be muted');
    console.error('Test console.error, should be unmuted');

    expect(this.warn.getLogs()).to.equal(
      'Test console.warn, should be muted\n');
    expect(this.error.getLogs()).to.be.undefined;

    this.error.mute();

    console.warn('Test console.warn 2, should be muted');
    console.error('Test console.error 2, should be muted');

    expect(this.warn.getLogs()).to.equal(`Test console.warn, should be muted
Test console.warn 2, should be muted
`);
    expect(this.error.getLogs()).to.equal(
      'Test console.error 2, should be muted\n');

    this.warn.unmute();

    console.warn('Test console.warn 3, should be unmuted');
    console.error('Test console.error 3, should be muted');

    expect(this.warn.getLogs()).to.be.undefined;
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
`);

    this.warn.capture();

    console.warn('Test console.warn 4, should be captured');
    console.error('Test console.error 4, should be muted');

    expect(this.warn.getLogs()).to.equal(
      'Test console.warn 4, should be captured\n');
    expect(this.error.getLogs()).to.equal(
      `Test console.error 2, should be muted
Test console.error 3, should be muted
Test console.error 4, should be muted
`);
  }));

  it(`console.log and console.info don't interfere`, unmutedCallback(
  function() {
    this.log.mute();

    console.log('Test console.log, should be muted');
    console.info('Test console.info, should be unmuted');

    expect(this.log.getLogs()).to.equal('Test console.log, should be muted\n');
    expect(this.info.getLogs()).to.be.undefined;

    this.info.mute();

    console.log('Test console.log 2, should be muted');
    console.info('Test console.info 2, should be muted');

    expect(this.log.getLogs()).to.equal(`Test console.log, should be muted
Test console.log 2, should be muted
`);
    expect(this.info.getLogs()).to.equal(
      'Test console.info 2, should be muted\n');

    this.log.unmute();

    console.log('Test console.log 3, should be unmuted');
    console.info('Test console.info 3, should be muted');

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.info.getLogs()).to.equal(
      `Test console.info 2, should be muted
Test console.info 3, should be muted
`);

    this.log.capture();

    console.log('Test console.log 4, should be captured');
    console.info('Test console.info 4, should be muted');

    expect(this.log.getLogs()).to.equal(
      'Test console.log 4, should be captured\n');
    expect(this.info.getLogs()).to.equal(
      `Test console.info 2, should be muted
Test console.info 3, should be muted
Test console.info 4, should be muted
`);
  }));

});
