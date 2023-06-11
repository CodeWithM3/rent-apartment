require('module-alias/register')

const Redis = require("ioredis");
// const Queue = require('bull');
const Pusher = require('@provider/pusher');
const OpenAIProvider = require('@provider/open_ai');
const redisClient = new Redis(process.env.REDIS_URI);
const {
  CONFIG,
  FEATURE_FLAGS,
  QUEUES,
} = require('@helpers/constants')
const {
  Worker,
  Job,
  Queue,
} = require('bullmq');
const pusher = new Pusher();
const growthbook = require('@provider/growthbook');
const {
  toCamel
} = require('@helpers/case_converters')
const AirbrakeProvider = require('@provider/airbrake');
const airbrake_provider = new AirbrakeProvider();

class DaVinciHandler {
  static async process(job, helpers) {
    console.log("inside DaVinciHandler", job.name)
    await this[toCamel(job.name)](job.data, helpers);
  }
  static async textCompletion(payload, helpers) {

    const open_ai_provider = new OpenAIProvider();
    const {
      messages,
      input_text,
      user_id,
      prompt_id
    } = payload;
    const is_open_ai_pusher_enabled = await helpers.growthbook.getFeatureValue(FEATURE_FLAGS.STREAMING_OPENAI_TO_SOCKET_ENABLED, CONFIG.STREAMING_OPENAI_TO_SOCKET_ENABLED);
    //  const open_ai_cache_streaming_expiry = await helpers.growthbook.getFeatureValue(FEATURE_FLAGS.OPENAI_CACHE_STREAMING_EXPIRY, CONFIG.OPENAI_CACHE_STREAMING_EXPIRY);

    function onComplete(err, full_text) {
      if (err) {
        airbrake_provider.notify(err, {
          category: "textCompletionOnComplete",
          entity_id: prompt_id,
          user_id: user_id
        });
        throw err
      };
      if (err instanceof Error) {
        airbrake_provider.notify(err, {
          category: "textCompletionOnComplete",
          entity_id: prompt_id,
          user_id: user_id
        });
        throw new Error(err)
      }
      setTimeout(() => {
        const EVENT_PAYLOAD = {
          event: 'prompt_text_stream_on_end',
          channel: `${prompt_id}_channel`,
          payload: {
            prompt_id,
            type: 'text_completion',
            user_id,
          }
        }
        helpers.pusher.publish(EVENT_PAYLOAD)
      }, 200)

      const output = {
        user_id: user_id,
        prompt_id: prompt_id,
        output_text: full_text,
      }
      console.log("AI Stream Live Output:", output) 
    }

    function onStream(err, data) {
      if (err) {
        airbrake_provider.notify(err, {
          category: "textCompletionOnStream",
          entity_id: prompt_id,
          user_id: user_id
        });
        throw err
      };
      if (err instanceof Error) {
        airbrake_provider.notify(err, {
          category: "textCompletionOnStream",
          entity_id: prompt_id,
          user_id: user_id
        });
        throw new Error(err)
      }
      console.log(`ID: ${prompt_id} AI-stream: `, data);
      const EVENT_PAYLOAD = {
        event: 'prompt_text_stream_on_data',
        channel: `${prompt_id}_channel`,
        payload: {
          text: data || ' ',
          prompt_id,
          type: 'text_completion',
          user_id,
        }
      }
      helpers.pusher.publish(EVENT_PAYLOAD)
    }
    messages.push({
      role: "user",
      content: input_text
    })
    const streamResponse = await open_ai_provider.processChatChunk({
      messages,
      user_id,

    }, onStream, onComplete)

  }

  static async getAnswerCache(payload, helpers) {
    const {
      input_text
    } = payload
    return await helpers.redis.get(`query_${input_text}`)
  }

}

module.exports = async function (job) {
  console.log("inside worker", job.data)
  return await DaVinciHandler.process(job, {
    redis: redisClient,
    pusher,
    growthbook,
    queues: {
    
    },
    
  })
}