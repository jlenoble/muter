import Muter from '../src/muter';
import {unmutedCallback, presetLoggers} from './helpers.help';

import {expect} from 'chai';

const listener = (args) => {
  console.info('Caught:', ...args);
};

describe('Testing events in Muter:', function() {

  before(presetLoggers);

  it('Muted Muter emits on log', unmutedCallback(function() {

    this.info.mute();

    this.log.addListener('log', listener);
    this.log.mute();

    console.log('Message 1');
    console.log('Message 2');

    expect(this.log.getLogs()).to.equal(`Message 1
Message 2
`);

    this.log.removeListener('log', listener);
    this.log.unmute();

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.info.getLogs()).to.equal(`Caught: Message 1
Caught: Message 2
`);

    this.info.unmute();

    expect(this.info.getLogs()).to.be.undefined;
  }));

  it('Captured Muter emits on log', unmutedCallback(function() {

    this.info.mute();

    this.log.addListener('log', listener);
    this.log.capture();

    console.log('Captured message 1');
    console.log('Captured message 2');

    expect(this.log.getLogs()).to.equal(`Captured message 1
Captured message 2
`);

    this.log.removeListener('log', listener);
    this.log.unmute();

    expect(this.log.getLogs()).to.be.undefined;
    expect(this.info.getLogs()).to.equal(`Caught: Captured message 1
Caught: Captured message 2
`);

    this.info.unmute();

    expect(this.info.getLogs()).to.be.undefined;
  }));

});
