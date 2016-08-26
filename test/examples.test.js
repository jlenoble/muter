import Muter from '../src/muter';
import {unmutedCallback, originalLoggingFunctions}
  from './helpers.help';

import {expect} from 'chai';
import chalk from 'chalk';

describe(`Testing README.md examples:`, function() {

  it(`README.md usage example works fine`, unmutedCallback(function() {
    const muter = Muter(console, 'error');

    muter.mute(); // console.error outputs nothing anymore
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    console.error('Test message'); // This message should not be printed
    expect(muter.getLogs()).to.equal('Test message\n');

    console.log(muter.getLogs('red'), ': expected and printed in red');
    // Should print on stdout 'Test message' in red and ': expected and
    // printed in red' in default color

    muter.unmute(); // Restores console.error to default behavior
    expect(console.error).to.equal(originalLoggingFunctions.error);

    console.log(muter.getLogs('red'),
      'undefined expected and printed in default color');
    // Should print on stdout 'undefined' and 'undefined expected and
    // printed in default color', all in default color

    muter.capture(); // stderr will still outputs logs
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    console.error('Another test message'); // This message should be
    // printed in default color
    expect(muter.getLogs()).to.equal('Another test message\n');

    console.log(muter.getLogs('red'),
      ': expected twice, first in default color, second in red');
    // Should print on stdout 'Another test message' in red and
    // ': expected twice, first in default color, second in red'

    muter.uncapture(); // Restores console.error to default behavior
    expect(console.error).to.equal(originalLoggingFunctions.error);

    console.log(muter.getLogs('red'),
      'undefined expected and printed in default color');
    // Should print on stdout 'undefined' and 'undefined expected and
    // printed in default color', all in default color

    muter.capture(); // stderr will still output logs
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    console.error('And another test message'); // This message should be
    // printed in default color
    expect(muter.getLogs()).to.equal('And another test message\n');

    console.log(muter.flush('red'), ': message expected thrice, first in' +
      ' default color, then 2 in red');
    // Should print on stderr 'And another test message' in red and
    // should print on stdout 'And another test message' in red and
    // ': message expected thrice, first in default color, then 2 in red');
    // Muter should still be capturing
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    muter.uncapture(); // Restores console.error to default behavior
    expect(console.error).to.equal(originalLoggingFunctions.error);
    expect(muter.getLogs('red')).to.be.undefined;
  }));

  it('README.md format example works fine', unmutedCallback(function() {
    const muter = Muter(console, 'error');

    muter.mute();
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    for (let i = 1; i < 4; i++) {
      console.error('%d) %s %d', i, 'Cute test message', i);
      // Prints nothing
    }

    console.log(muter.getLogs());
    // Prints:
    // 1) Cute test message 1
    // 2) Cute test message 2
    // 3) Cute test message 3
    expect(muter.getLogs()).to.equal(`1) Cute test message 1
2) Cute test message 2
3) Cute test message 3
`);

    muter.unmute();
    expect(console.error).to.equal(originalLoggingFunctions.error);
  }));

  it('README.md concurrency example works fine', unmutedCallback(function() {
    const log = Muter(console, 'log');
    const log2 = Muter(console, 'log');
    const error = Muter(console, 'error');
    const warn = Muter(console, 'warn');

    expect(log === log2).to.be.true;
    expect(log === error).to.be.false;
    expect(warn === error).to.be.false;
    expect(log === warn).to.be.false;

    log.mute();
    expect(console.log).not.to.equal(originalLoggingFunctions.log);

    error.capture();
    expect(console.error).not.to.equal(originalLoggingFunctions.error);

    warn.mute();
    expect(console.warn).not.to.equal(originalLoggingFunctions.warb);

    console.log('muted log message');
    // Prints nothing

    console.error('captured/unmuted error message');
    // Prints on stderr 'captured/unmuted error message'

    console.warn('muted warning');
    // Prints nothing

    console.warn(log.getLogs('blue'));
    // Prints nothing

    console.warn(error.getLogs('yellow'));
    // Prints nothing

    log.unmute();
    expect(console.log).to.equal(originalLoggingFunctions.log);

    error.uncapture();
    expect(console.error).to.equal(originalLoggingFunctions.error);

    console.log(warn.getLogs(),
      ': 3 messages expected, 1st-default color, 2nd-blue, 3rd-yellow');
    // Prints on stdout:
    // 'muted warning' in default color
    // 'muted log message' in blue
    // 'captured/unmuted error message' in yellow
    expect(warn.getLogs()).to.equal(`muted warning
${chalk.blue('muted log message\n')}
${chalk.yellow('captured/unmuted error message\n')}
`);

    warn.unmute();
    expect(console.warn).to.equal(originalLoggingFunctions.warn);
  }));

});
