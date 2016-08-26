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

  it('Method shared across loggers');

});
