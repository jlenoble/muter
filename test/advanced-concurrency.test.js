import Muter from '../src/muter';

import {expect} from 'chai';
import moment from 'moment';
import gutil from 'gulp-util';
import chalk from 'chalk';
import ansiRegex from 'ansi-regex';

describe('Testing advanced concurrency for Muters:', function() {
  // Advanced concurrency means when two advanced Muters share one or more
  // simple Muters

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
