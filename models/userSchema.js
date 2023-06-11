const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const {
    v4: uuid
} = require('uuid');
const {
    Worker,
    Job,
    Queue,
} = require('bullmq');
const {
    CONFIG,
    SUBSCRIPTION_PLANS,
    QUEUES
} = require('@helpers/constants')
const Redis = require('ioredis');
const redis_bus = new Redis(CONFIG.REDIS_URI);


const SlackBotQueue = new Queue(QUEUES.SLACKBOT_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})
const CreditRewardQueue = new Queue(QUEUES.CREDIT_REWARD_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})
const PNQueue = new Queue(QUEUES.PN_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})

const EmailQueue = new Queue(QUEUES.EMAIL_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})

const Pusher = require('@provider/pusher');
const pusher = new Pusher()

const user = {
    oauth_id: {
        type: String,
        index: true,
        required: false
    },
    first_name: {
        type: String,
        default: null,
        required: false
    },
    last_name: {
        type: String,
        default: null,
        required: false
    },
    email: {
        type: String,
        default: null,
        index: true,
        required: false
    },
    region_code: {
        type: String,
        default: null,
        uppercase: true,
        required: false
    },
    country: {
        type: String,
        default: null,
        required: false
    },
    education_level: {
        type: String,
        default: null,
        required: false
    },
    fields_of_study: {
        type: [String],
        default: null,
        required: false
    },
    account_type: {
        type: String,
        default: null,
        required: false
    },
    user_id: {
        type: String,
        index: true,
        required: true,
    },
    username: {
        type: String,
        index: true,
        required: false,
        lowercase: true,

    },
    active: {
        type: Boolean,
        default: false
    },
    identity_id: {
        type: String,
        default: null,
        required: false
    },
    subscription_plan: {
        enums: Object.values(SUBSCRIPTION_PLANS),
        type: String,
        default: SUBSCRIPTION_PLANS.FREE,
        required: true
    },
    subscription_id: {
        type: String,
        default: null,
        required: false
    },
    is_deleted: {
        type: Boolean,
        default: false,
        required: false
    },
    is_bot: {
        type: Boolean,
        default: false,
        required: false
    },
    credits: {
        type: Number,
        required: false,
        default: 0
    },
    burnt_credits: {
        type: Number,
        required: false,
        default: 0
    },
    linked_company_id: {
        type: String,
        required: false,
        index: true,
        default: null
    },
    linked_company_code: {
        type: String,
        required: false,
        index: true,
        default: null
    },
    in_app_time: {
        type: Number,
        required: false,
        default: 0
    },
    mailing_list_id: {
        type: String,
        required: false
    },
    profile_image_url: {
        type: String,
        required: false,
        default: null
    },
    description: {
        type: String,
        required: false,
        default: null
    },
    elastic_id: {
        type: String,
        index: true,
        default: null,
        required: false,
    },
    email_verified: {
        type: Boolean,
        default: false,
        required: false
    },
    email_verification_code: {
        type: String,
        default: null,
        required: false
    },
    temp_meta: {
        type: Object,
        default: null,
        required: false
    },
    language: {
        type: String,
        default: null,
        required: false
    }
}


const ex_params = {
    redis_bus,
    queues: {
        PNQueue,
        CreditRewardQueue,
        SlackBotQueue,
        EmailQueue
    },
    pusher,
    search_indexes: {
        // UserSearchIndex
    }
}

const userSchema = mongoose.Schema(user, {
    timestamps: true,
})

userSchema.post('save', async function () {
    try {
        await this.cacheUserInfo()
        // await this.updateInIndex(UserSearchIndex);
    } catch (error) {
        console.log(error)
    }
})

userSchema.post('remove', async function () {
    try {
        await this.deleteInIndex(UserSearchIndex);
    } catch (error) {
        console.log(error)
    }
})
// require("@model_method/userSchemaMethods/helper_methods")(userSchema, ex_params);
// require("@model_method/userSchemaMethods/notification_methods")(userSchema, ex_params);
// require("@model_static/userSchemaStatics")(userSchema, ex_params);

const User = mongoose.model('User', userSchema)

module.exports = User