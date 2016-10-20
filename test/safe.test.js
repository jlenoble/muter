import Muter from '../src/muter';
import chalk from 'chalk';
import {expect} from 'chai';

['muted', 'captured'].forEach(wrapper => {

  describe(`Testing '${wrapper}' function wrapper`, function() {

    ['simple', 'advanced'].forEach(type => {

      describe(`with ${type} muter:`, function() {

        it(`'${wrapper}' cleans up after running to completion`, function() {

          const muter = Muter(console, 'log', type === 'advanced' ?
            {color: 'green'} : undefined);
          const log = Muter(console, 'log');

          const func = Muter[wrapper](muter, function() {
            expect(console.log.restore).not.to.be.undefined;
            expect(console.log.restore.sinon).not.to.be.undefined;
            console.log('lorem ipsum');

            if (type === 'advanced') {
              expect(muter).not.to.equal(log);
              expect(muter.getLogs()).to.equal(
                chalk.green('lorem ipsum\n'));
              expect(log.listeners('log').length).to.equal(1);
            } else {
              expect(muter).to.equal(log);
              expect(muter.getLogs()).to.equal('lorem ipsum\n');
              expect(log.listeners('log').length).to.equal(0);
            }
          });

          expect(log.listeners('log').length).to.equal(0);
          expect(console.log.restore).to.be.undefined;
          expect(muter.getLogs()).to.be.undefined;
          expect(func).not.to.throw();
          expect(muter.getLogs()).to.be.undefined;
          expect(console.log.restore).to.be.undefined;
          expect(log.listeners('log').length).to.equal(0);

        });

        it(`'${wrapper}' cleans up after encountering an exception`, function() {

          const muter = Muter(console, 'log', type === 'advanced' ?
            {color: 'red'} : undefined);
          const log = Muter(console, 'log');

          const func = Muter[wrapper](muter, function() {
            expect(console.log.restore).not.to.be.undefined;
            expect(console.log.restore.sinon).not.to.be.undefined;
            console.log('lorem ipsum');

            if (type === 'advanced') {
              expect(muter).not.to.equal(log);
              expect(muter.getLogs()).to.equal(
                chalk.red('lorem ipsum\n'));
              expect(log.listeners('log').length).to.equal(1);
            } else {
              expect(muter).to.equal(log);
              expect(muter.getLogs()).to.equal('lorem ipsum\n');
              expect(log.listeners('log').length).to.equal(0);
            }

            throw new Error('Controlled error');
          });

          expect(log.listeners('log').length).to.equal(0);
          expect(console.log.restore).to.be.undefined;
          expect(muter.getLogs()).to.be.undefined;
          expect(func).to.throw(Error, 'Controlled error');
          expect(muter.getLogs()).to.be.undefined;
          expect(console.log.restore).to.be.undefined;
          expect(log.listeners('log').length).to.equal(0);

        });

      });

    });

  });

});
