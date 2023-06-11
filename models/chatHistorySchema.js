const mongoose = require('mongoose')
const chat_history = {
    user_id: {
        type: String,
        index: true,
        required: true
    },
    entity_id: {
        type: String,
        index: true,
        required: true
    },
    source: {
        enum: ['prompt'], // CONFIG VARIABLE
        type: String,
        index: true,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    display_query: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    action_type: {
        enum: ['text_completion', 'text_paraphrasing', 'text_plagiarism_check', 'text_summarization'],
        type: String,
        index: true,
        required: true
    },
    session_id: {
        type: String,
        index: true
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
    query_category: {
        type: String,
        default: null,
        required: false
    }
}

const chatHistorySchema = mongoose.Schema(chat_history, {
    timestamps: true,
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
module.exports = ChatHistory;