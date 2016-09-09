import SimpleMuter from './simple-muter';
import AdvancedMuter from './advanced-muter';
import gulp from 'gulp';
import gutil from 'gulp-util';

function Muter(logger, method, options = {}) {

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

export default Muter;
