const Pusher = require('pusher');

class PusherProvider {
  constructor() {
    const {
      PUSHER_APP_ID,
      PUSHER_KEY,
      PUSHER_SECRET
    } = process.env;
    this.pusher = new Pusher({
      appId: PUSHER_APP_ID,
      key: PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: 'eu',
      useTLS: true,
    });
  }

  async publish(params) {
    await this.pusher.trigger(params.channel, params.event, params.payload);
  }
}

module.exports = PusherProvider;