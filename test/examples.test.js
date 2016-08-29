import Muter from '../src/muter';
import {presetLoggers, unmutedCallback} from './helpers.help';

import {expect} from 'chai';
import chalk from 'chalk';
import gulp from 'gulp';
import gutil, {log as gulpLogger} from 'gulp-util';

describe(`Testing README.md examples:`, function() {

  before(presetLoggers);

  it(`README.md Basic muting example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing
    expect(muter.getLogs()).to.equal('Lorem ipsum\n');

    muter.unmute(); // The Muter stops muting console.log
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Basic capturing example works fine`,
  unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.capture(); // The Muter starts capturing console.log

    console.log('Lorem ipsum'); // console.log prints as usual
    expect(muter.getLogs()).to.equal('Lorem ipsum\n');

    muter.uncapture(); // The Muter stops capturing console.log
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Using options examples work fine`, unmutedCallback(function() {
    var muter = Muter([console, 'log', {
      color: 'magenta',
      format: (...args) => {
        return args.join(' • ');
      },
      endString: ' ▪▪▪'
    }]); // Sets a Muter on console.log with special formatting options
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem', 'ipsum'); // console.log prints nothing
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));

    muter.unmute(); // The Muter stops muting console.log
    expect(muter.getLogs()).to.be.undefined;

    muter.capture(); // The Muter starts capturing console.log

    console.log('Lorem', 'ipsum'); // console.log prints as usual with no special formatting
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));

    muter.uncapture(); // The Muter stops capturing console.log
    expect(muter.getLogs()).to.be.undefined;

    muter = Muter([console, 'log', {
      color: 'magenta',
      format: (...args) => {
        return args.join(' • ');
      },
      endString: ' ▪▪▪',
      alter: true
    }]); // Sets a Muter on console.log with special formatting options
    muter.capture(); // The Muter starts capturing console.log

    console.log('Lorem', 'ipsum'); // console.log is altered to print 'Lorem • ipsum ▪▪▪' in magenta
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));

    muter.uncapture(); // The Muter stops capturing console.log
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Overriding options example works fine`,
  unmutedCallback(function() {
    const muter = Muter([console, 'log', {
      color: 'magenta',
      format: (...args) => {
        return args.join(' • ');
      },
      endString: ' ▪▪▪'
    }]); // Sets a Muter on console.log with special formatting options
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem', 'ipsum'); // console.log prints nothing
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));
    expect(muter.getLogs({
      color: 'cyan',
      endString: ' ▪'
    })).to.equal(chalk.cyan('Lorem • ipsum ▪'));
    expect(muter.getLogs({
      format: (...args) => {
        return args.join(' ••• ');
      }
    })).to.equal(chalk.magenta('Lorem ••• ipsum ▪▪▪'));

    muter.unmute(); // The Muter stops muting console.log
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Clearing example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing
    expect(muter.getLogs()).to.equal('Lorem ipsum\n');

    muter.unmute(); // The Muter stops muting console.log
    expect(muter.getLogs()).to.be.undefined;

    console.log('dolor sit amet'); // console.log prints as expected
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Distinct Muters examples work fine`,
  unmutedCallback(function() {
    const logMuter = Muter(console, 'log'); // Sets a Muter on console.log
    const errorMuter = Muter(console, 'error'); // Sets a Muter on console.error

    logMuter.mute(); // logMuter starts muting console.log
    errorMuter.mute(); // errorMuter starts muting console.error

    console.log('Lorem'); // console.log prints nothing
    console.error('ipsum'); // console.error prints nothing
    console.error('dolor'); // console.error prints nothing
    console.log('sit'); // console.log prints nothing

    expect(logMuter.getLogs()).to.equal('Lorem\nsit\n');
    expect(errorMuter.getLogs()).to.equal('ipsum\ndolor\n');

    logMuter.unmute(); // logMuter stops muting console.log
    errorMuter.unmute(); // errorMuter stops muting console.error

    expect(logMuter.getLogs()).to.be.undefined;
    expect(errorMuter.getLogs()).to.be.undefined;

    const stdoutWrite = Muter(process.stdout, 'write'); // Sets a Muter on process.stdout.write
    const stderrWrite = Muter(process.stderr, 'write'); // Sets a Muter on process.stderr.write

    expect(process.stdout.write).to.equal(process.stderr.write);

    stdoutWrite.mute(); // stdoutWrite starts muting process.stdout.write
    stderrWrite.mute(); // stderrWrite starts muting process.stderr.write

    expect(process.stdout.write).not.to.equal(process.stderr.write);

    process.stdout.write('Lorem'); // process.stdout.write prints nothing
    process.stderr.write('ipsum'); // process.stderr.write prints nothing
    process.stderr.write('dolor'); // process.stderr.write prints nothing
    process.stdout.write('sit'); // process.stdout.write prints nothing

    expect(stdoutWrite.getLogs()).to.equal('Loremsit');
    expect(stderrWrite.getLogs()).to.equal('ipsumdolor');

    stdoutWrite.unmute(); // stdoutWrite stops muting process.stdout.write
    stderrWrite.unmute(); // stderrWrite stops muting process.stderr.write

    expect(stdoutWrite.getLogs()).to.be.undefined;
    expect(stderrWrite.getLogs()).to.be.undefined;
  }));

  it(`README.md Related Muters example works fine`, unmutedCallback(function() {
    const log1 = Muter([console, 'log', {
      color: 'blue'
    }]); // Sets a Muter on console.log
    const log2 = Muter([console, 'log', {
      color: 'red'
    }]); // Associates different options to the same Muter

    log1.mute(); // log1 starts muting console.log
    expect(log2.isMuting).to.be.true;
    expect(log2.mute.bind(log2)).to.throw(Error,
      `Muter is already activated, don't call 'mute'`);

    console.log('Lorem'); // console.log prints nothing
    console.log('ipsum'); // console.log prints nothing

    expect(log1.getLogs()).to.equal(chalk.blue('Lorem\n') +
      chalk.blue('ipsum\n'));
    expect(log2.getLogs()).to.equal(chalk.red('Lorem\n') +
      chalk.red('ipsum\n'));

    log1.unmute(); // log1 stops muting console.log
    expect(log2.unmute.bind(log2)).not.to.throw();
  }));

  it(`README.md Overlapping Muters example works fine`,
  unmutedCallback(function() {
    const muter1 = Muter(
      [console, 'log'],
      [console, 'warn']
    ); // Sets a Muter on console.log and console.warn

    const muter2 = Muter(
      [console, 'warn'],
      [console, 'error']
    ); // Shares the Muter on console.warn and sets a Muter on console.error

    muter1.mute(); // muter1 mutes console.log and console.warn

    console.log('Lorem ipsum'); // console.log prints nothing
    console.warn('dolor'); // console.warn prints nothing
    console.error('sit amet'); // console.error prints as expected

    expect(muter1.getLogs()).to.equal('Lorem ipsum\ndolor\n');
    expect(muter2.getLogs.bind(muter2)).to.throw(Error,
      `Muters referenced by advanced Muter have inconsistent activated states`);
    expect(muter2.mute.bind(muter2)).to.throw(Error,
      `Muter is already activated, don't call 'mute'`);

    Muter(console, 'error').mute(); // Retrieves Muter singleton and mutes console.error, putting muter2 in a consistent state

    expect(muter2.getLogs()).to.equal('dolor\n');

    muter1.unmute(); // Unmutes console.log and console.warn, leaving muter2 in an inconsistent state
    muter2.unmute(); // Fine, re-unmutes console.warn and unmutes console.error, putting back muter2 in a consistent state
  }));

  it(`README.md Coordinated muting/capturing example works fine`,
  unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'warn'],
      [console, 'error']
    ); // Sets a Muter on console.log, console.warn and console.error

    muter.mute(); // The Muter mutes simultaneously console.log, console.warn and console.error

    console.log('Lorem'); // console.log prints nothing
    console.warn('ipsum'); // console.warn prints nothing
    console.log('dolor'); // console.log prints nothing
    console.error('sit'); // console.error prints nothing
    console.log('amet'); // console.log prints nothing

    expect(muter.getLogs({
      logger: console,
      method: 'log'
    })).to.equal('Lorem\ndolor\namet\n');
    expect(muter.getLogs({
      logger: console,
      method: 'warn'
    })).to.equal('ipsum\n');
    expect(muter.getLogs({
      logger: console,
      method: 'error'
    })).to.equal('sit\n');
    expect(muter.getLogs()).to.equal('Lorem\nipsum\ndolor\nsit\namet\n');

    muter.unmute(); // The Muter unmutes simultaneously console.log, console.warn and console.error
  }));

  it(`README.md Printing example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing

    muter.print(); // Prints 'Lorem ipsum\n'

    console.log('dolor sit amet'); // console.log prints nothing

    muter.print(); // Prints 'Lorem ipsum\ndolor sit amet\n'
    throw new Error('Bad printing');
    muter.print(0); // Prints 'Lorem ipsum\n'
    muter.print(1); // Prints 'dolor sit amet\n'

    muter.unmute(); // The Muter stops muting console.log
  }));

  it(`README.md Flushing example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing
    throw new Error('Use process.stdout to capture printing');
    muter.flush(); // Prints 'Lorem ipsum\n'
    muter.flush(); // Prints nothing

    console.log('dolor sit amet'); // console.log prints nothing

    muter.flush(); // Prints 'dolor sit amet\n'
    muter.flush(); // Prints nothing

    muter.unmute(); // The Muter stops muting console.log
  }));

  it(`README.md Forgetting example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing

    expect(muter.getLogs()).to.equal('Lorem ipsum\n');
    expect(muter.forget()).to.equal('Lorem ipsum\n');
    expect(muter.getLogs()).to.equal('');

    console.log('dolor sit amet'); // console.log prints nothing

    expect(muter.getLogs()).to.equal('dolor sit amet\n');
    expect(muter.forget()).to.equal('dolor sit amet\n');
    expect(muter.getLogs()).to.equal('');

    muter.unmute(); // The Muter stops muting console.log
  }));

  it(`README.md Format strings example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log

    muter.mute(); // Mutes console.log

    for (let i = 1; i < 4; i++) {
      console.log('%d) %s%d', i, 'message', i); // console.log prints nothing
    }

    expect(muter.getLogs()).to.equal('1) message1\n2) message2\n3) message3\n');

    muter.unmute(); // Unmutes console.log
  }));

  it(`README.md Handling hidden logging methods example works fine`,
  unmutedCallback(function() {
    function log() {
      console.info('>>>>');
      console.log(...arguments);
      console.info('<<<<');
    } // A custom logging function printing on interleaved console.info and console.log

    const muter = Muter(
      [console, 'info'],
      [console, 'log']
    ); // Sets a Muter on consoleL.info and console.log

    muter.mute(); // Mutes console.info and console.log, therefore muting the custom logging function 'log'

    log('Lorem', 'ipsum'); // Prints nothing
    log('dolor', 'sit', 'amet'); // Prints nothing

    expect(muter.getLogs()).to.equal(
      '>>>>\nLorem ipsum\n<<<<\n>>>>\ndolor sit amet\n<<<<\n');

    muter.unmute(); // Unmutes console.info and console.log, therefore unmuting  the custom logging function 'log'
  }));

  it(`README.md Special arguments example works fine`,
  unmutedCallback(function() {
    const muter1 = Muter(process); // Sets Muters on process.stdout.write and process.stderr.write, therefore allowing to silence the whole process
    muter1.mute();
    process.stdout.write('Lorem');
    process.stderr.write('ipsum');
    expect(muter1.getLogs()).to.equal('Loremipsum');
    muter1.unmute();

    const muter2 = Muter(console); // Sets Muters on all four logging methods of console
    muter2.mute();
    console.log('Lorem');
    console.info('ipsum');
    console.warn('dolor');
    console.error('sit');
    expect(muter2.getLogs()).to.equal('Lorem\nipsum\ndolor\nsit\n');
    muter2.unmute();

    const muter3 = Muter(gutil); // Sets a Muter on gulp-util logger
    muter3.mute();
    gulpLogger('Lorem ipsum');
    expect(muter3.getLogs()).to.match(/\[.+\d\d:\d\d:\d\d.+\] Lorem ipsum\n/);
    muter3.unmute();
    expect(muter3.getLogs()).to.be.undefined;

    const muter4 = Muter(gulp); // Same as Muter(gutil)
    muter4.mute();
    gulpLogger('Lorem ipsum');
    expect(muter4.getLogs()).to.match(/\[.+\d\d:\d\d:\d\d.+\] Lorem ipsum\n/);
    muter4.unmute();
    expect(muter3.getLogs()).to.be.undefined;
  }));

});
