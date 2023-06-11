exports.CONFIG = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shisheo',
    MONGO_CONFIG: process.env.MONGO_CONFIG || 'local',
    REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
    NODE_ENV: process.env.NODE_ENV || 'development',
    GROWTHBOOK_API_HOST: process.env.GROWTHBOOK_API_HOST,
    GROWTHBOOK_SDK_SECRET: process.env.GROWTHBOOK_SDK_SECRET,
    STREAMING_OPENAI_TO_SOCKET_ENABLED: process.env.STREAMING_OPENAI_TO_SOCKET_ENABLED,
    COST_PER_ACTION_TEXT: process.env.COST_PER_ACTION_TEXT,
}


exports.QUEUES_LIST = ['DaVinciQueue', 'PriorityDaVinciQueue']

exports.DAVINCI_QUEUE_SUBSCRIPTION_TYPE_MAP = {
    'free': 'DaVinciQueue',
    'premium': 'PriorityDaVinciQueue'
}

exports.SUBSCRIPTION_PLANS = {
    PREMIUM: 'premium',
    FREE: 'free'
}

exports.QUEUES  = {
    DA_VINCI_QUEUE:'DaVinciQueue',
    PRIORITY_DA_VINCI_QUEUE:'PriorityDaVinciQueue',
}

exports.FEATURE_FLAGS = {
    FREE_USER_PROMPT_DAILY_LIMIT: 'free_user_prompt_daily_limit',
    FREE_USER_PROMPT_LIFETIME_LIMIT: 'free_user_prompt_lifetime_limit',
    FREE_USER_PROMPT_HARD_LIMIT: 'free_user_prompt_hard_limit',
    REWARD_CREDITS_WATCHED_ADS: 'reward_credits_watched_ads',
    REWARD_CREDITS_SIGN_UP: 'reward_credits_sign_up',
    COST_PER_TEXT_ACTION: 'cost_per_action_text',
    REWARD_CREDITS_PREMIUM_SUBSCRIBER: 'reward_credits_premium_subscriber',
    REWARD_CREDITS_FREE_SUBSCRIBER: 'reward_credits_free_subscriber',
    COST_PER_ACTION_TEXT: 'cost_per_action_text',
    REWARD_CREDITS_REFERRAL_REDIRECT: 'reward_credits_referral_redirect',
    MAXIMUM_IP_COUNT: 'maximum_ip_count',
    FREE_DAILY_GRANT: 'free_daily_grant',
    STRIPE_SUBSCRIPTION_REWARD: 'stripe_subscription_reward',
    VERIFY_EMAIL_TEMPLATE_ID: 'verify_email_template_id',
    SENT_CREDIT_TEMPLATE_ID: 'sent_credit_template_id',
    RECEIVED_CREDIT_TEMPLATE_ID: 'received_credit_template_id',
    STUDENT_LINKED_COMPANY_EMAIL_TEMPLATE_ID: 'student_linked_company_email_template_id',
    OAUTH_SIGNUP_EMAIL_TEMPLATE_ID: "oauth_signup_email_template_id",
    OPENAI_MODEL: 'openai_model'
}