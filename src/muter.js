import SimpleMuter from './simple-muter';
import AdvancedMuter from './advanced-muter';

function Muter(logger, method, options = {}) {

  if (Array.isArray(logger)) {
    var muter = Object.create(AdvancedMuter.prototype);
    AdvancedMuter.apply(muter, arguments);
    return muter;
  } else {
    return new SimpleMuter(logger, method, options);
  }

}

export default Muter;
