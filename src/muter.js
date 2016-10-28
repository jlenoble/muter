import SimpleMuter from './simple-muter';
import AdvancedMuter from './advanced-muter';
import gulp from 'gulp';
import gutil from 'gulp-util';

export default function Muter(logger, method, options = {}) {

  if (logger === process || logger === undefined) {
    return Muter(
      [process.stdout, 'write'],
      [process.stderr, 'write']
    );
  } else if (logger === console && method === undefined) {
    return Muter(
      [console, 'log'],
      [console, 'info'],
      [console, 'warn'],
      [console, 'error']
    );
  } else if (logger === gulp || logger === gutil) {
    return Muter(
      [console, 'log'],
      [process.stdout, 'write']
    );
  } else if (Array.isArray(logger)) {
    var muter = Object.create(AdvancedMuter.prototype);
    AdvancedMuter.apply(muter, arguments);
    return muter;
  } else if (Object.keys(options).length > 0) {
    return Muter([logger, method, options]);
  } else {
    return new SimpleMuter(logger, method);
  }

}

export function muted(muter, func) {
  return function(...args) {
    muter.mute();
    try {
      let ret = func.apply(this, args);
      if (ret instanceof Promise) {
        ret = ret.then(res => {
          muter.unmute();
          return res;
        }, err => {
          muter.unmute();
          throw err;
        });
      } else {
        muter.unmute();
      }
      return ret;
    } catch (e) {
      muter.unmute();
      throw e;
    }
  };
};

export function captured(muter, func) {
  return function(...args) {
    muter.capture();
    try {
      let ret = func.apply(this, args);
      if (ret instanceof Promise) {
        ret = ret.then(res => {
          muter.uncapture();
          return res;
        }, err => {
          muter.uncapture();
          throw err;
        });
      } else {
        muter.uncapture();
      }
      return ret;
    } catch (e) {
      muter.uncapture();
      throw e;
    }
  };
};

Muter.muted = muted;
Muter.captured = captured;
