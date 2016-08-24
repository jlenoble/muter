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
      this[method].removeListener('log', this.listener);
    }
  });

  ['stdout', 'stderr'].forEach(std => {
    this[std].removeListener('log', this.listener);
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

  it('Advanced muters can capture their underlying muters',
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

  it('An advanced Muter can capture gutil.log', unmutedCallback(function() {
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
    const t1 = moment(match[1], 'hh:mm:ss');
    const t2 = moment(match[3], 'hh:mm:ss');
    const t3 = moment();

    expect(t1).to.be.at.most(t2);
    expect(t2).to.be.at.most(t3);

    const grayStrings = chalk.gray(' ').match(ansiRegex());
    const message = '[' + grayStrings[0] + t1.format('hh:mm:ss') +
      grayStrings[1] + '] A test message logged by gutil.log\n' +
      '[' + grayStrings[0] + t2.format('hh:mm:ss') + grayStrings[1] +
      '] A second test message logged by gutil.log\n';

    expect(muter.getLogs()).to.equal(message);
  }));

});
