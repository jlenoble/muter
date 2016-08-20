import SimpleMuter from './simple-muter';

function Muter(logger, method, options = {}) {
  return new SimpleMuter(logger, method, options);
}

export default Muter;
