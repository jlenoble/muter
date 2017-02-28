import Muter, {muted, captured} from '../src/muter';
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
    var muter = Muter(console, 'log', {
      color: 'magenta',
      format: (...args) => {
        return args.join(' • ');
      },
      endString: ' ▪▪▪'
    }); // Sets a Muter on console.log with special formatting options
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem', 'ipsum'); // console.log prints nothing
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));

    muter.unmute(); // The Muter stops muting console.log
    expect(muter.getLogs()).to.be.undefined;

    muter.capture(); // The Muter starts capturing console.log

    console.log('Lorem', 'ipsum'); // console.log prints as usual with no special formatting, that is 'Lorem ipsum \n'
    expect(muter.getLogs()).to.equal(chalk.magenta('Lorem • ipsum ▪▪▪'));

    muter.uncapture(); // The Muter stops capturing console.log
    expect(muter.getLogs()).to.be.undefined;
  }));

  it(`README.md Overriding options example works fine`,
  unmutedCallback(function() {
    const muter = Muter(console, 'log', {
      color: 'magenta',
      format: (...args) => {
        return args.join(' • ');
      },
      endString: ' ▪▪▪'
    }); // Sets a Muter on console.log with special formatting options
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
    const log1 = Muter(console, 'log', {
      color: 'blue'
    }); // Sets a Muter on console.log; log1 is wrapper around the actual Muter
    const log2 = Muter(console, 'log', {
      color: 'red'
    }); // Associates another wrapper with different options to the same Muter
    const log = Muter(console, 'log'); // The actual Muter, with no special options

    log1.mute(); // log1 starts muting console.log
    expect(log.isMuting).to.be.true;
    expect(log1.isMuting).to.be.true;
    expect(log2.isMuting).to.be.false;

    console.log('Lorem'); // console.log prints nothing
    console.log('ipsum'); // console.log prints nothing

    expect(log.getLogs()).to.equal('Lorem\nipsum\n');
    expect(log1.getLogs()).to.equal(chalk.blue('Lorem\n') +
      chalk.blue('ipsum\n'));
    expect(log2.getLogs()).to.be.undefined;

    log2.mute(); // log2 starts muting too
    expect(log.isMuting).to.be.true;
    expect(log1.isMuting).to.be.true;
    expect(log2.isMuting).to.be.true;

    console.log('dolor'); // console.log prints nothing

    expect(log.getLogs()).to.equal('Lorem\nipsum\ndolor\n');
    expect(log1.getLogs()).to.equal(chalk.blue('Lorem\n') +
      chalk.blue('ipsum\n') + chalk.blue('dolor\n'));
    expect(log2.getLogs()).to.equal(chalk.red('dolor\n'));

    log1.unmute(); // log1 stops muting console.log, but log2 still is
    expect(log.isMuting).to.be.true;
    expect(log1.isMuting).to.be.false;
    expect(log2.isMuting).to.be.true;

    console.log('sit'); // console.log prints nothing

    expect(log.getLogs()).to.equal('Lorem\nipsum\ndolor\nsit\n');
    expect(log1.getLogs()).to.be.undefined;
    expect(log2.getLogs()).to.equal(chalk.red('dolor\n') + chalk.red('sit\n'));

    log2.unmute(); // log2 stops muting console.log, which is fully unmuted
    expect(log.isMuting).to.be.false;
    expect(log1.isMuting).to.be.false;
    expect(log2.isMuting).to.be.false;

    console.log('amet'); // console.log prints 'amet'

    expect(log.getLogs()).to.be.undefined;
    expect(log1.getLogs()).to.be.undefined;
    expect(log2.getLogs()).to.be.undefined;
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
    expect(muter2.getLogs()).to.be.undefined;

    expect(muter2.mute.bind(muter2)).not.to.throw();
    expect(muter2.getLogs()).to.equal('');
    expect(muter2.getLogs({
      logger: console,
      method: 'warn'
    })).to.equal('');
    expect(muter1.getLogs({
      logger: console,
      method: 'warn'
    })).to.equal('dolor\n');

    muter1.unmute(); // Unmutes console.log but not console.warn (still muted by muter2), now being in an inconsistent state
    muter2.unmute(); // Unmutes console.warn and console.error, putting back muter1 in a consistent state
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
    this.stdout.capture();
    muter.mute(); // The Muter starts muting console.log

    console.log('Lorem ipsum'); // console.log prints nothing

    muter.print(); // Prints 'Lorem ipsum\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n');

    console.log('dolor sit amet'); // console.log prints nothing

    muter.print(); // Prints 'Lorem ipsum\ndolor sit amet\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n' +
      'Lorem ipsum\ndolor sit amet\n');

    muter.print(0); // Prints 'Lorem ipsum\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n' +
      'Lorem ipsum\ndolor sit amet\nLorem ipsum\n');

    muter.print(1); // Prints 'dolor sit amet\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n' +
      'Lorem ipsum\ndolor sit amet\nLorem ipsum\ndolor sit amet\n');

    muter.unmute(); // The Muter stops muting console.log
    this.stdout.uncapture();
  }));

  it(`README.md Flushing example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'log'); // Sets a Muter on console.log
    muter.mute(); // The Muter starts muting console.log
    this.stdout.capture();

    console.log('Lorem ipsum'); // console.log prints nothing
    muter.flush(); // Prints 'Lorem ipsum\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n');
    muter.flush(); // Prints nothing
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\n');

    console.log('dolor sit amet'); // console.log prints nothing

    muter.flush(); // Prints 'dolor sit amet\n'
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\ndolor sit amet\n');
    muter.flush(); // Prints nothing
    expect(this.stdout.getLogs()).to.equal('Lorem ipsum\ndolor sit amet\n');

    muter.unmute(); // The Muter stops muting console.log
    this.stdout.uncapture();
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

  it(`README.md 'muted' and 'captured' Convenience wrappers example works fine`,
    unmutedCallback(function() {
    const muter = Muter(console);

    const func = function(...args) {
      console.log(args[0].toString());
      console.error(args[1].toString());
      console.info(args[2].toString());
      return muter.getLogs();
    };

    const safelyMutedFunc = muted(muter, func);
    const safelyCapturedFunc = captured(muter, func);

    const res1 = safelyMutedFunc('lorem', 'ipsum', 'dolor', 'sit', 'amet'); // Prints nothing: muter is muting
    const res2 = safelyCapturedFunc('lorem', 'ipsum', 'dolor', 'sit', 'amet'); // Prints 'lorem\nipsum\ndolor\n';

    expect(res1).to.equal(res2);
    expect(res2).to.equal('lorem\nipsum\ndolor\n'); // muter was capturing
    expect(res2).not.to.equal(muter.getLogs()); // muter is no longer muting nor capturing

    try {
      safelyMutedFunc('lorem'); // Prints nothing, throws error
    } catch(e) {
      expect(e).to.match(/TypeError: Cannot read property 'toString' of undefined/);
      expect(muter.getLogs()).to.be.undefined;
    }

    try {
      safelyCapturedFunc('lorem'); // Prints 'lorem', throws error
    } catch(e) {
      expect(e).to.match(/TypeError: Cannot read property 'toString' of undefined/);
      expect(muter.getLogs()).to.be.undefined;
    }
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
  }));

});
