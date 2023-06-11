const {
    setPolyfills,
    GrowthBook,
} = require("@growthbook/growthbook");

const Redis = require("ioredis");
const {
    CONFIG
} = require('@helpers/constants')
const redisClient = new Redis(CONFIG.REDIS_URI);
setPolyfills({
    // Required when using built-in feature loading and Node 17 or lower
    fetch: require("cross-fetch"),
    // Required when using encrypted feature flags and Node 18 or lower
    SubtleCrypto: require("node:crypto").webcrypto.subtle,
    // Optional, can make feature rollouts faster
    EventSource: require("eventsource"),
    // Optional, can reduce startup times by persisting cached feature flags
    // localStorage: {
    //     // Example using Redis
    //     getItem: (key) => redisClient.get(key),
    //     setItem: (key, value) => redisClient.set(key, value),
    // },
});
class GrowthbookProvider {
    constructor() {
        console.log(CONFIG.GROWTHBOOK_API_HOST, CONFIG.GROWTHBOOK_SDK_SECRET)
        this.gb = new GrowthBook({
            apiHost: CONFIG.GROWTHBOOK_API_HOST,
            clientKey: CONFIG.GROWTHBOOK_SDK_SECRET,
            enableDevMode: true,
        });

        // Wait for features to be downloaded
        this.gb.loadFeatures({
            // When features change, update the GrowthBook instance automatically
            // Default: `false`
            autoRefresh: true,
            // If the network request takes longer than this (in milliseconds), continue
            // Default: `0` (no timeout)
            timeout: 1000,
        }).then(() => {
            this.gb.refreshFeatures({
                timeout: 1000,
            });
            console.log("Features loaded");
        })
    }

    getClient() {
        return this.gb;
    }

    async getAllfeatures() {
        const features = this.gb.getFeatures();
        await redisClient.set("feature_flags", JSON.stringify(features))
        return features;
    }

    async getFeatureValue(key, env) {
        const features = await redisClient.get("feature_flags")
        if (!features) {
            return this.gb.getFeatureValue(key, env)
        }
        const features_json = JSON.parse(features)
        if (features_json[key]) return features_json[key].defaultValue
        return this.gb.getFeatureValue(key, env)
    }


}
const growthbook = new GrowthbookProvider();
console.log("Starting refresher")
growthbook.getAllfeatures();
setInterval(async () => {
    growthbook.getClient().refreshFeatures({
        timeout: 1000,
    });
    await growthbook.getAllfeatures();
    // console.log(growthbook.getAllfeatures())
}, 2000);

module.exports = growthbook;