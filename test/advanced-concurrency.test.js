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
    const muter1 = Muter(console, 'log'); // Is this.log
    const muter2 = Muter(// References this.log and this.error
      [console, 'log'],
      [console, 'error']
    );
    const muter3 = Muter(// References this.log and this.info
      [console, 'log'],
      [console, 'info']
    );

    muter1.mute(); // Mutes console.log

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;

    muter2.unmute(); // Changes nothing, as muter2 is not listening

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;

    muter3.mute(); // Mutes console.info

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');

    muter2.unmute(); // Changes nothing, as muter2 is not listening

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');

    muter2.mute(); // Mutes console.error

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.true;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.true;
    expect(muter2.getLogs()).to.equal('');

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');

    muter3.unmute(); // unmutes console.info, not console.log, but stops
    // listening to it

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.true;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.true;
    expect(muter2.getLogs()).to.equal('');

    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;

    muter2.unmute(); // unmutes console.error and console.log as it is the last
    // advanced Muter to listen to it

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.false;

    expect(muter1.isMuting).to.be.false;
    expect(muter1.getLogs()).to.be.undefined;

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.false;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.false;
    expect(muter3.getLogs()).to.be.undefined;

    muter2.mute();
    muter3.mute();

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.true;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.true;
    expect(muter2.getLogs()).to.equal('');

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');

    muter1.unmute(); // Master unmute, affects all advanced Muters

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.true;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.false;
    expect(muter1.getLogs()).to.be.undefined;

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

    muter2.unmute(); // A way to put back an advanced Muter in a consistent state,
    // knowing that it is currently listening; If the advanced Muter were not
    // listening, then muter2.mute() would also put it back in a consistent state

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.false;
    expect(muter1.getLogs()).to.be.undefined;

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

    muter3.repair(); // Calling mute or unmute to put back an advanced Muter
    // in a consistent state does toggle the listening state; Using repair
    // instead, the listening state is preserved

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.false;
    expect(this.info.isMuting).to.be.true;

    expect(muter1.isMuting).to.be.true;
    expect(muter1.getLogs()).to.equal('');

    expect(muter2.isMuting).to.be.false;
    expect(muter2.isCapturing).to.be.false;
    expect(muter2.isActivated).to.be.false;
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter3.isMuting).to.be.true;
    expect(muter3.isCapturing).to.be.false;
    expect(muter3.isActivated).to.be.true;
    expect(muter3.getLogs()).to.equal('');
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

    logger1.log('message1');
    logger2.log('message2');

    expect(this.logger1.getLogs()).to.be.be.undefined;
    expect(this.logger2.getLogs()).to.be.be.undefined;
    expect(this.logger1.getLogs({color: 'blue'})).to.be.be.undefined;
    expect(this.logger2.getLogs({color: 'blue'})).to.be.be.undefined;

    expect(muter.getLogs()).to.equal(chalk.cyan('message1\n') +
      chalk.magenta('message2\n'));
    expect(muter.getLogs({color: 'blue'})).to.equal(chalk.blue('message1\n') +
      chalk.blue('message2\n'));

    this.logger1.mute();

    logger1.log('message3');
    logger2.log('message4');

    expect(this.logger1.getLogs()).to.equal(chalk.green('message3\n'));
    expect(this.logger2.getLogs()).to.be.undefined;
    expect(this.logger1.getLogs({color: 'blue'})).to.equal(
      chalk.blue('message3\n'));
    expect(this.logger2.getLogs({color: 'blue'})).to.be.undefined;

    expect(muter.getLogs()).to.equal(chalk.cyan('message1\n') +
      chalk.magenta('message2\n') +
      chalk.cyan('message3\n') +
      chalk.magenta('message4\n'));
    expect(muter.getLogs({color: 'blue'})).to.equal(chalk.blue('message1\n') +
      chalk.blue('message2\n') +
      chalk.blue('message3\n') +
      chalk.blue('message4\n'));

    this.logger2.mute();

    logger1.log('message5');
    logger2.log('message6');

    expect(this.logger1.getLogs()).to.equal(chalk.green('message3\n') +
      chalk.green('message5\n'));
    expect(this.logger2.getLogs()).to.equal(chalk.red('message6\n'));
    expect(this.logger1.getLogs({color: 'blue'})).to.equal(
      chalk.blue('message3\n') +   chalk.blue('message5\n'));
    expect(this.logger2.getLogs({color: 'blue'})).to.equal(
      chalk.blue('message6\n')
    );

    expect(muter.getLogs()).to.equal(chalk.cyan('message1\n') +
      chalk.magenta('message2\n') +
      chalk.cyan('message3\n') +
      chalk.magenta('message4\n') +
      chalk.cyan('message5\n') +
      chalk.magenta('message6\n'));
    expect(muter.getLogs({color: 'blue'})).to.equal(chalk.blue('message1\n') +
      chalk.blue('message2\n') +
      chalk.blue('message3\n') +
      chalk.blue('message4\n') +
      chalk.blue('message5\n') +
      chalk.blue('message6\n'));

    muter.unmute();

    logger1.log('message7');
    logger2.log('message8');

    expect(this.logger1.getLogs()).to.equal(chalk.green('message3\n') +
      chalk.green('message5\n') +
      chalk.green('message7\n'));
    expect(this.logger2.getLogs()).to.equal(chalk.red('message6\n') +
      chalk.red('message8\n'));
    expect(this.logger1.getLogs({color: 'blue'})).to.equal(
      chalk.blue('message3\n') +   chalk.blue('message5\n') +
      chalk.blue('message7\n'));
    expect(this.logger2.getLogs({color: 'blue'})).to.equal(
      chalk.blue('message6\n') + chalk.blue('message8\n')
    );

    expect(muter.getLogs()).to.be.undefined;
    expect(muter.getLogs({color: 'blue'})).to.be.undefined;
  }));

});
