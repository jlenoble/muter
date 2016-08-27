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

  it('Shared simple Muter');

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
