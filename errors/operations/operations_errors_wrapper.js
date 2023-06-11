class OperationsError extends Error {
    constructor(message) {
      super(message.toString());
      this.code = message.error;
      this.name = 'OperationsError';
    }
  }
  module.exports = OperationsError;