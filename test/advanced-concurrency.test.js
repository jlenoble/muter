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
    const muter2 = Muter(console, 'log');
    const muter3 = Muter(
      [console, 'log'],
      [console, 'info']
    );

    muter1.mute();

    expect(muter1.isMuting).to.be.true;
    expect(muter2.isMuting).to.be.true;
    expect(() => muter3.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter3.isCapturing).to.be.false;
    expect(() => muter3.isActivated).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter3.getLogs.bind(muter3)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(this.log.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.false;

    muter2.unmute();

    expect(muter1.isMuting).to.be.false;
    expect(muter2.isMuting).to.be.false;
    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;
    expect(this.log.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    muter3.mute();

    expect(muter1.isMuting).to.be.true;
    expect(muter2.isMuting).to.be.true;
    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');
    expect(this.log.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.true;

    muter2.unmute();

    expect(muter1.isMuting).to.be.false;
    expect(muter2.isMuting).to.be.false;
    expect(() => muter3.isMuting).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent muting state`);
    expect(muter3.isCapturing).to.be.false;
    expect(() => muter3.isActivated).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(muter3.getLogs.bind(muter3)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated state`);
    expect(this.log.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;
  }));

  it('Direct restore');

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

  it('Colors');

});
