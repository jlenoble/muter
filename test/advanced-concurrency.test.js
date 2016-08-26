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

describe('Testing advanced concurrency for Muters:', function() {
  // Advanced concurrency means when two advanced Muters share one or more
  // simple Muters

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
  });

  it('Shared simple Muter');

  it('Direct restore');

  it('Method shared across loggers');

});
