import Muter from '../src/muter';

import {expect} from 'chai';
import moment from 'moment';
import gutil from 'gulp-util';
import chalk from 'chalk';
import ansiRegex from 'ansi-regex';

function unmute() {
  console.log.restore && console.log.restore();
  console.info.restore && console.info.restore();
  console.warn.restore && console.warn.restore();
  console.error.restore && console.error.restore();
  process.stdout && process.stdout.write.restore &&
    process.stdout.write.restore();
  process.stderr && process.stderr.write.restore &&
    process.stderr.write.restore();
}

function removeListeners() {
  ['log', 'info', 'warn', 'error'].forEach(method => {
    if (this[method]) {
      this[method].removeAllListeners();
    }
  });

  ['stdout', 'stderr'].forEach(std => {
    this[std].removeAllListeners();
  });
}

describe('Testing interleaved Muters:', function() {

  const unmutedCallback = function(func) {
    // Wrapping Mocha callbacks is necessary due to the fact that these tests
    // interfere with Mocha's logs, so we undo output capturing before Mocha
    // reports its results (and can't use 'after' as 'it' messages are
    // output right away)
    return function() {
      try {
        func.call(this);

        // Make sure there won't be any memory leak from test to test
        removeListeners.call(this);

        // Mocha shouldn't output a message if test passes since
        // stdout/stderr is muted, so unmute before leaving
        unmute();
      } catch (e) {
        // Make sure there won't be any memory leak from test to test
        removeListeners.call(this);

        // In order for Mocha to print all info when failing, unmute before
        // rethrowing
        unmute();

        throw e;
      }
    };
  };

  before(function() {
    this.methods = ['log', 'info', 'warn','error'];
    this.methods.forEach(method => {
      this[method] = Muter(console, method);
    });

    this.stds = ['stdout', 'stderr'];
    this.stds.forEach(std => {
      this[std] = Muter(process[std], 'write');
    });

    this.randomMethod = () => {
      const n = Math.floor(this.methods.length * Math.random());
      return this.methods[n];
    };

    this.nTests = 10;
  });

  for (let j = 0; j < 2; j++) {

    it(`console loggers can be interleaved, run ${j + 1}`,
    unmutedCallback(function() {
      this.methods.forEach(method => {
        this[method].mute();
      });

      var methods = [];
      var message = '';
      var messages = [];
      this.listener = args => {
        messages.push(args.join(' '));
      };

      this.methods.forEach(method => {
        this[method].on('log', this.listener);
      });

      for (let i = 0; i < this.nTests; i++) {
        let method = this.randomMethod();
        methods.push(method);
        console[method](method + i);
        message += method + i;
      }

      expect(messages.join('')).to.equal(message);
      this.methods.forEach(method => {
        expect(this[method].listenerCount('log')).to.equal(1);
        // We don't remove listeners and count on unmutedCallback to clean up
        // Next identical test in the loop must work or there is a memory leak
        // due to zombie listeners
      });
    }));

  }

  it('Advanced Muters can capture their underlying Muters',
  unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'info']
    );

    muter.mute();

    console.log('log1');
    console.info('info1');
    console.info('info2');
    console.log('log2');

    expect(this.log.getLogs()).to.equal('log1\nlog2');
    expect(this.info.getLogs()).to.equal('info1\ninfo2');
    expect(muter.getLogs()).to.equal('log1\ninfo1\ninfo2\nlog2\n');
  }));

  it('Advanced Muters can capture gutil.log', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [process.stdout, 'write']
    );

    muter.mute();

    gutil.log('A test message logged by gutil.log');
    gutil.log('A second test message logged by gutil.log');

    const logs = muter.getLogs();
    const match = logs.match(
      /^\[.+(\d\d:\d\d:\d\d).+\](.|[\r\n])+\[.+(\d\d:\d\d:\d\d).+\](.|[\r\n])+$/);
    const t1 = moment(match[1], 'HH:mm:ss');
    const t2 = moment(match[3], 'HH:mm:ss');
    const t3 = moment();

    expect(t1).to.be.at.most(t2);
    expect(t2).to.be.at.most(t3);

    const grayStrings = chalk.gray(' ').match(ansiRegex());
    const message = '[' + grayStrings[0] + t1.format('HH:mm:ss') +
      grayStrings[1] + '] A test message logged by gutil.log\n' +
      '[' + grayStrings[0] + t2.format('HH:mm:ss') + grayStrings[1] +
      '] A second test message logged by gutil.log\n';

    expect(muter.getLogs()).to.equal(message);
  }));

  it('Advanced Muters share API with simple Muters',
  unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'error']
    );

    expect(muter.mute).to.be.instanceof(Function);
    expect(muter.unmute).to.be.instanceof(Function);
    expect(muter.capture).to.be.instanceof(Function);
    expect(muter.uncapture).to.be.instanceof(Function);
    expect(muter.getLogs).to.be.instanceof(Function);
    expect(muter.flush).to.be.instanceof(Function);

    expect(muter.isMuting).not.to.be.undefined;
    expect(muter.isCapturing).not.to.be.undefined;
    expect(muter.isActivated).not.to.be.undefined;
  }));

  it('Advanced Muters do clean up on unmute', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'error']
    );

    muter.mute();

    console.log('log');
    console.error('error');

    expect(this.log.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.true;
    expect(this.log.isCapturing).to.be.false;
    expect(this.error.isCapturing).to.be.false;

    expect(this.log.listenerCount('log')).to.equal(1);
    expect(this.error.listenerCount('log')).to.equal(1);

    expect(muter.getLogs()).to.equal('log\nerror\n');

    muter.unmute();

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.log.isCapturing).to.be.false;
    expect(this.error.isCapturing).to.be.false;

    expect(this.log.listenerCount('log')).to.equal(0);
    expect(this.error.listenerCount('log')).to.equal(0);

    expect(muter.getLogs()).to.be.undefined;

  }));

  it('Advanced Muters do clean up on uncapture', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'error']
    );

    muter.capture();

    console.log('captured log');
    console.error('captured error');

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.log.isCapturing).to.be.true;
    expect(this.error.isCapturing).to.be.true;

    expect(this.log.listenerCount('log')).to.equal(1);
    expect(this.error.listenerCount('log')).to.equal(1);

    expect(muter.getLogs()).to.equal('captured log\ncaptured error\n');

    muter.uncapture();

    expect(this.log.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(this.log.isCapturing).to.be.false;
    expect(this.error.isCapturing).to.be.false;

    expect(this.log.listenerCount('log')).to.equal(0);
    expect(this.error.listenerCount('log')).to.equal(0);

    expect(muter.getLogs()).to.be.undefined;

  }));

  it('Initializing with same logger/method twice throws an error',
  unmutedCallback(function() {
    expect(Muter.bind(undefined, [console, 'log'], [console, 'log'])).to
      .throw(Error, 'Interleaving same logger twice');
  }));

  it(`States are the conjunction of every states`, unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'warn'],
      [console, 'error']
    );

    muter.mute();
    expect(this.log.isMuting).to.be.true;
    expect(this.warn.isMuting).to.be.true;
    expect(this.error.isMuting).to.be.true;
    expect(muter.isMuting).to.be.true;
    expect(this.log.isActivated).to.be.true;
    expect(this.warn.isActivated).to.be.true;
    expect(this.error.isActivated).to.be.true;
    expect(muter.isActivated).to.be.true;

    muter.unmute();
    expect(this.log.isMuting).to.be.false;
    expect(this.warn.isMuting).to.be.false;
    expect(this.error.isMuting).to.be.false;
    expect(muter.isMuting).to.be.false;
    expect(this.log.isActivated).to.be.false;
    expect(this.warn.isActivated).to.be.false;
    expect(this.error.isActivated).to.be.false;
    expect(muter.isActivated).to.be.false;

    muter.capture();
    expect(this.log.isCapturing).to.be.true;
    expect(this.warn.isCapturing).to.be.true;
    expect(this.error.isCapturing).to.be.true;
    expect(muter.isCapturing).to.be.true;
    expect(this.log.isActivated).to.be.true;
    expect(this.warn.isActivated).to.be.true;
    expect(this.error.isActivated).to.be.true;
    expect(muter.isActivated).to.be.true;

    muter.uncapture();
    expect(this.log.isCapturing).to.be.false;
    expect(this.warn.isCapturing).to.be.false;
    expect(this.error.isCapturing).to.be.false;
    expect(muter.isCapturing).to.be.false;
    expect(this.log.isActivated).to.be.false;
    expect(this.warn.isActivated).to.be.false;
    expect(this.error.isActivated).to.be.false;
    expect(muter.isActivated).to.be.false;
  }));

  it('Muting twice an advanced Muter throws', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'error']
    );

    muter.mute();
    expect(muter.mute.bind(muter)).to.throw(Error,
      `Muter is already activated, don't call 'mute'`);
  }));

  it('Unmuting twice an advanced Muter is Ok', unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [console, 'error']
    );

    muter.mute();
    muter.unmute();
    expect(muter.unmute.bind(muter)).not.to.throw();
    expect(muter.isActivated).to.be.false;
  }));

  it('Flushing advanced Muters works like simple Muters',
  unmutedCallback(function() {
    const muter = Muter(
      [console, 'log'],
      [process.stdout, 'write']
    );

    muter.mute();

    console.log('log message');
    process.stdout.write('write message');
    process.stdout.write('write message 2');
    console.log('log message 2');

    expect(muter.getLogs()).to.equal(`log message
write messagewrite message 2log message 2
`);

    muter.flush();

    expect(this.log.getLogs()).to.equal('');
    expect(this.error.getLogs()).to.equal('');
    expect(muter.getLogs()).to.equal('');

    expect(this.log.flush()).to.equal('');
    expect(this.error.flush()).to.equal('');
    expect(muter.flush()).to.equal('');

    muter.unmute();

    expect(this.log.flush()).to.be.undefined;
    expect(this.error.flush()).to.be.undefined;
    expect(muter.flush()).to.be.undefined;
  }));

  it('Handling colors');

});
