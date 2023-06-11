const mongoose = require('mongoose')
const {
CONFIG, 
QUEUES
}=require('@helpers/constants')
const {
    Worker,
    Job,
    Queue,
} = require('bullmq');
const Redis = require('ioredis')
const redis_bus = new Redis(CONFIG.REDIS_URI);
const DaVinciQueue = new Queue(QUEUES.DA_VINCI_QUEUE, {
    connection: new Redis(CONFIG.REDIS_URI)
})

const apartment = {
    image_url: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        index: true
    },
    currency:{
        type: String,
        required: true,
        index: true
    },
    amenities:{
        type: Array,
        required: false,
        index: true
    }
}

const ex_params = {
    redis_bus,
    queues: {
        DaVinciQueue,
    }
}

const apartmentSchema = mongoose.Schema(apartment, {timestamps: true})

apartmentSchema.pre('save', async function(next){
    next()
})

// require("@model_method/apartmentSchemaMethods/helper_methods")(apartmentSchema, ex_params);
// require("@model_static/apartmentSchemaStatics")(apartmentSchema, ex_params);
const Apartment = mongoose.model('Apartment', apartmentSchema)
module.exports = Apartment
