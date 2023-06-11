const {
    Configuration,
    OpenAIApi
} = require("openai");
const growthbook = require('@provider/growthbook')
const {
    CONFIG,
    FEATURE_FLAGS,
} = require('@helpers/constants')
class OpenAIProvider {
    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        this.openai = openai;
    }
    async process(input_text) {
        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt: input_text,
            temperature: 0.8,
            max_tokens: 3999,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        return response.data;
    }

    async processChunk({
        input_text,
        max_tokens = 1500,
    }, onStreamCallback, onCompleteCallback) {
        try {
            const response = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: input_text,
                temperature: 0.8,
                max_tokens: max_tokens,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stream: true,
            }, {
                responseType: "stream"
            });
            let fullMessage = '';
            response.data.on("data", (data) => {
                const lines = data.toString().split("\n")
                    .filter((line) => line.trim() !== "");
                for (const line of lines) {
                    const message = line.replace(/^data: /, "");
                    if (message === "[DONE]") {
                        console.log("Done streaming : ", message)
                        onCompleteCallback(null, fullMessage)
                        break; // Stream finished
                    }
                    try {
                        const parsed = JSON.parse(message);
                        const chunk = parsed.choices[0].text
                        fullMessage += chunk;
                        onStreamCallback(null, chunk)
                    } catch (error) {
                        console.error("Could not JSON parse stream message", message, error);
                        onStreamCallback(error, null)
                    }
                }
            });
            return response.data;
        } catch (err) {
            console.log(err, err.message)
            onCompleteCallback(err, null)
            return err;
        }
    }

    async processChat({
        messages
    }) {
        const response = await this.openai.createChatCompletion({
            model: await growthbook.getFeatureValue(FEATURE_FLAGS.OPENAI_MODEL, CONFIG.OPENAI_MODEL),
            messages: messages,
            temperature: 0.8,
        });
        return response.data;
    }

    async processChatChunk({
        messages,
    }, onStreamCallback, onCompleteCallback) {
        try {
            const response = await this.openai.createChatCompletion({
                model: await growthbook.getFeatureValue(FEATURE_FLAGS.OPENAI_MODEL, CONFIG.OPENAI_MODEL),
                messages: messages,
                stream: true,
            }, {
                responseType: "stream"
            });

            //  const completion_text = completion.data.choices[0].message.content;
            let fullMessage = '';
            response.data.on("data", (data) => {
                // console.log(data);
                const lines = data.toString().split("\n")
                    .filter((line) => line.trim() !== "");
                for (const line of lines) {
                    const message = line.replace(/^data: /, "");
                    if (message === "[DONE]") {
                        console.log("Done streaming : ", message)
                        onCompleteCallback(null, fullMessage)
                        // resolve(fullMessage);
                        break; // Stream finished
                    }
                    try {
                        //console.log(message);
                        const parsed = JSON.parse(message);
                        const chunk = parsed.choices[0].delta.content
                        if (chunk) fullMessage += chunk;
                        onStreamCallback(null, chunk)
                    } catch (error) {
                        console.error("Could not JSON parse stream message", message, error.message);
                        onStreamCallback(error, null)
                    }
                }
            });
            //  return response.data;
        } catch (err) {
            //console.log('err')
            if (err.response) {
                console.log(err.response.status);
                console.log(err.response.data);
            } else {
                console.log(err.message);
            }
            onCompleteCallback(err, null)
            return err;
        }
    }

    async processChatSync({
        messages
    }) {
        return new Promise((resolve, reject) => {
            function onComplete(err, full_text) {
                if (err) reject(err);
                if (err instanceof Error) reject(err)

                return resolve(full_text)
            }

            function onStream(err, data) {
                if (err) {
                    reject(err)
                }
            }
            this.processChatChunk({
                messages
            }, onStream, onComplete)
        })
    }
}
module.exports = OpenAIProvider