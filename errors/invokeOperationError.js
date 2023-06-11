const OperationError = require('./operations/operations_errors_wrapper');

const invokeOperationError = (code) => {
  const error = {
    error: code,
  };
  throw new OperationError(error);
};

module.exports = invokeOperationError;