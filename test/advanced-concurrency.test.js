import Muter from '../src/muter';
import {unmutedCallback, presetLoggers} from './helpers.help';

import {expect} from 'chai';
import moment from 'moment';
import gutil from 'gulp-util';
import chalk from 'chalk';
import ansiRegex from 'ansi-regex';

describe('Testing advanced concurrency for Muters:', function() {
  // Advanced concurrency means when two advanced Muters share one or more
  // simple Muters

  before(presetLoggers);

  it('Shared simple Muter', unmutedCallback(function() {
    const muter1 = Muter(console, 'log');
    const muter2 = Muter(
      [console, 'log'],
      [console, 'error']
    );
    const muter3 = Muter(
      [console, 'log'],
      [console, 'info']
    );

    muter1.mute();

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.true;

    expect(() => muter2.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter2.isCapturing).to.be.false;
    expect(() => muter2.isActivated).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter2.getLogs.bind(muter2)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);

    expect(() => muter3.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter3.isCapturing).to.be.false;
    expect(() => muter3.isActivated).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter3.getLogs.bind(muter3)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);

    muter2.unmute();

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.false;

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;

    muter3.mute();

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;

    expect(() => muter2.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter2.isCapturing).to.be.false;
    expect(() => muter2.isActivated).to.be.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter2.getLogs.bind(muter2)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');

    muter2.unmute();

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.false;

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(() => muter3.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter3.isCapturing).to.be.false;
    expect(() => muter3.isActivated).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter3.getLogs.bind(muter3)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
  }));

  it('Direct restore', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'warn']
    );

    muter.mute();

    console.log('log1');
    console.warn('warn1');

    console.log.restore();

    console.warn('warn2');
    console.log('log2');

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.warn.getLogs()).to.equal('warn1\nwarn2\n');
    expect(muter.getLogs.bind(muter)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);

    console.warn.restore();

    expect(muter.getLogs()).to.be.undefined;
    expect(muter.isActivated).to.be.false;
    expect(muter.isMuting).to.be.false;
  }));

  it('Method shared across loggers', unmutedCallback(function() {
    const logger1 = {log: console.log};
    const logger2 = {log: console.log};

    this.logger1 = Muter(logger1, 'log');
    this.logger2 = Muter(logger2, 'log');

    const muter = Muter(
      [logger1, 'log', {color: 'cyan'}],
      [logger2, 'log', {color: 'magenta'}]
    );

    muter.capture();

    logger1.log('LOGGER 1');
    logger2.log('LOGGER 2');
    logger1.log('LOGGER 1');
    logger1.log('LOGGER 1');
    logger2.log('LOGGER 2');
    console.log('CONSOLE');

    expect(this.logger1.getLogs()).to.equal('LOGGER 1\nLOGGER 1\nLOGGER 1\n');
    expect(this.logger2.getLogs()).to.equal('LOGGER 2\nLOGGER 2\n');
    expect(this.log.getLogs()).to.be.undefined;
    expect(muter.getLogs()).to.equal(chalk.cyan('LOGGER 1\n') +
      chalk.magenta('LOGGER 2\n') +
      chalk.cyan('LOGGER 1\n') +
      chalk.cyan('LOGGER 1\n') +
      chalk.magenta('LOGGER 2\n'));

    muter.uncapture();
  }));

  it('Advanced color concurrency', unmutedCallback(function() {
    const logger1 = {log: console.log};
    const logger2 = {log: console.log};

    this.logger1 = Muter(logger1, 'log', {color: 'green'});
    this.logger2 = Muter(logger2, 'log', {color: 'red'});

    const muter = Muter(
      [logger1, 'log', {color: 'cyan'}],
      [logger2, 'log', {color: 'magenta'}]
    );

    muter.mute();

    logger1.log('green');
    logger2.log('red');

    expect(this.logger1.getLogs()).to.equal(chalk.green('green\n'));
    expect(this.logger2.getLogs()).to.equal(chalk.red('red\n'));
    expect(this.logger1.getLogs('blue')).to.equal(chalk.blue('green\n'));
    expect(this.logger2.getLogs('blue')).to.equal(chalk.blue('red\n'));
    expect(muter.getLogs()).to.equal(chalk.cyan('green\n') +
      chalk.magenta('red\n'));
    expect(muter.getLogs('blue')).to.equal(chalk.blue('green\n') +
      chalk.blue('red\n'));
  }));

});
