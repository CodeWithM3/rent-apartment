const mongoose = require('mongoose')
const {
CONFIG,
SUBSCRIPTION_PLANS,
FEATURE_FLAGS
}=require('@helpers/constants')
const {
    toCamel
} = require('@helpers/case_converters')
const ChatHistory= require('@model/chatHistorySchema.js')
const invokeOperationError = require('@errors/invokeOperationError');
const growthbook = require('@provider/growthbook')
module.exports = function(promptSchema, ex_params){
    console.log('inside prompt schema methods')
    promptSchema.methods.textCompletionHelper = async function (input_text, user_id) {
        const action_cost = Number(await growthbook.getFeatureValue(FEATURE_FLAGS.COST_PER_ACTION_TEXT, CONFIG.COST_PER_ACTION_TEXT))
        let all_chat_history = await ChatHistory.find({
            session_id: this._id,
            action_type: 'text_completion'
        })

        let word_count_limit = 1500;

        let chat_history = []
        let word_count = 0 //chat_history[0].content.split(' ').length;
        for (let i = all_chat_history.length - 1; i >= 0; i--) {
            const chat = all_chat_history[i];

            if (word_count >= word_count_limit) break;
            word_count += chat.query.split(' ').length + chat.answer.split(' ').length;
            chat_history.push({
                role: "assistant",
                content: chat.answer
            })
            chat_history.push({
                role: "user",
                content: chat.query
            })
        }
        chat_history = chat_history.reverse();
        const davinci_queue_payload = {
            type: "text_completion",
            payload: {
                input_text,
                user_id,
                prompt_id: this._id,
                messages: chat_history,
                action_cost
            }
        }
        await ex_params.queues.DaVinciQueue.add(davinci_queue_payload.type, davinci_queue_payload.payload, {
            timeout: 1000 * 45,
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 2000
            },
            removeOnComplete: 100,
        })
}    
promptSchema.methods.executePromptAction = async function (input_text, user_id, type, passed_id = false) {
    if (!input_text) input_text = this.input_text
    let alt_input_text = null;
    if (passed_id && type != 'text_completion') {
        alt_input_text = this.response_text || this.input_text
    }
    this.input_text = input_text
    this.status = "processing"
    this.last_action_type = type;
    this.action_history.push({
        type,
        timestamp: Date.now()
    })
    this.markModified('action_history');
    await this.save()
    const helper_function = toCamel(`${type}_helper`)
    if (!this[helper_function]) invokeOperationError("errors.type.unsupported")
    this[helper_function](alt_input_text || input_text, user_id)
}}