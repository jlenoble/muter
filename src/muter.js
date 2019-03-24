import SimpleMuter from './simple-muter';
import AdvancedMuter from './advanced-muter';
import cleanupWrapper from 'cleanup-wrapper';

export default function Muter (logger, method, options = {}) {
  if (logger === process || logger === undefined) {
    return new Muter(
      [process.stdout, 'write'],
      [process.stderr, 'write']
    );
  } else if (logger === console && method === undefined) {
    return new Muter(
      [console, 'log'],
      [console, 'info'],
      [console, 'warn'],
      [console, 'error']
    );
  } else if (Array.isArray(logger)) {
    // eslint-disable-next-line prefer-rest-params
    return new AdvancedMuter(...arguments);
  } else if (Object.keys(options).length > 0) {
    return new Muter([logger, method, options]);
  } else {
    return new SimpleMuter(logger, method);
  }
}

export function muted (muter, func) {
  return cleanupWrapper(func, {
    muter,
    before () {
      this.muter.mute();
    },
    after () {
      this.muter.unmute();
    },
  });
};

export function captured (muter, func) {
  return cleanupWrapper(func, {
    muter,
    before () {
      this.muter.capture();
    },
    after () {
      this.muter.uncapture();
    },
  });
};

Muter.muted = muted;
Muter.captured = captured;
