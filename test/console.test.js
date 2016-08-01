import muterFactory from '../src/muter';

import {expect} from 'chai';

const logger = console;
const methods = ['log', 'warn', 'error'];

methods.forEach(method => {

  describe(`Testing Muter factory with console.${method}:`, function() {

    it(`A muter mutes console.${method} by calling 'mute'`);

    it(`A muter unmutes console.${method} by calling 'unmute'`);

    it(`A muter returns muted messages of console.${method}` +
      ` by calling 'getLogs'`);

    it(`muter captures messages without muting console.${method}` +
      ` by calling 'capture'`);

    it(`A muter uncaptures console.${method}'s messages` +
      ` by calling 'uncapture'`);

    it(`Once unmuted, muter's method 'getLogs' returns nothing`);

  });

});
