const Airbrake = require('@airbrake/node');
const airbrakeExpress = require('@airbrake/node/dist/instrumentation/express');

class AirbrakeProvider {
  constructor() {
    this.airbrake = new Airbrake.Notifier({
      projectId: process.env.AIRBRAKE_ID,
      projectKey: process.env.AIRBRAKE_KEY,
      environment: process.env.NODE_ENV,
    });
    this.middlewareHandler = airbrakeExpress.makeMiddleware(this.airbrake);
    this.errorHandler = airbrakeExpress.makeErrorHandler(this.airbrake);
  }

  getMiddleware() {
    return this.middlewareHandler;
  }

  getErrorware() {
    return this.errorHandler;
  }

  getClient() {
    return this.airbrake;
  }

  notify(err, params) {
    this.airbrake.notify({
      error: err,
      params: params,
    });
  }
}
module.exports = AirbrakeProvider;