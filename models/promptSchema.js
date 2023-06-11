const mongoose = require('mongoose')
const Redis = require('ioredis');
const {
    Worker,
    Job,
    Queue,
} = require('bullmq');
const {
    CONFIG, QUEUES
} = require('@helpers/constants')
const redis_bus = new Redis(CONFIG.REDIS_URI);
const DaVinciQueue = new Queue(QUEUES.DA_VINCI_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})
const ParaphaseQueue = new Queue(QUEUES.PARAPHASE_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})
const PlagiarismCheckerQueue = new Queue(QUEUES.PLAGIARISM_CHECKER_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})
const PriorityDaVinciQueue = new Queue(QUEUES.PRIORITY_DA_VINCI_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})

const prompt = {
    input_text: {
        type: String,
        default: null,
        required: true
    },
    response_text: {
        type: String,
        default: null,
        required: false
    },
    raw_response_text: {
        type: String,
        default: null,
        required: false
    },
    user_id: {
        type: String,
        index: true,
        required: true
    },
    has_paraphrased: {
        type: Boolean,
        required: true,
        default: false
    },
    has_checked_plagiarism: {
        type: Boolean,
        required: true,
        default: false
    },
    has_queried_openai: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        enum: ['processing', 'completed', 'failed'],
        type: String,
        required: true,
        default: 'processing'
    },
    plagiarism_score: {
        type: Number,
        default: null,
        required: false,
    },
    plagiarism_sources: {
        type: Array,
        default: [],
        required: false,
    },
    plagiarism_citations: {
        type: Array,
        default: [],
        required: false,
    },
    action_history: {
        type: Array,
        required: false,
        default: []
    },
    last_action_type: {
        enum: ['text_completion', 'text_paraphrasing', 'text_plagiarism_check', 'text_summarization'],
        type: String,
        required: false,
        default: null
    },

}
const ex_params = {
    redis_bus,
    queues: {
        DaVinciQueue,
        ParaphaseQueue,
        PlagiarismCheckerQueue,
        PriorityDaVinciQueue
    }
}

const promptSchema = mongoose.Schema(prompt, {
    timestamps: true,
});
promptSchema.index({
    user_id: 1,
    _id: 1
}, {})



require("@model_method/promptSchemaMethods/helper_methods")(promptSchema, ex_params);
const prompt_schema = mongoose.model('Prompt', promptSchema);
module.exports = prompt_schema;