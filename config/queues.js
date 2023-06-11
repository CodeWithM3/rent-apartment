
const Redis = require('ioredis');
const {
    CONFIG,
    QUEUES_LIST
} = require('@helpers/constants')
const QueueMQ = require('bullmq');
const queue_bus = new Redis(CONFIG.REDIS_URI);
module.exports = () => {
    const queues = {};
    // QUEUES_LIST.forEach((queueName) => {
    //     queues[queueName] = new Queue(queueName, {
    //         createClient() {
    //             return queue_bus;
    //         },
    //     });
    // });
    QUEUES_LIST.forEach((queue) => {
        queues[queue] = new QueueMQ.Queue(queue, {
            connection: queue_bus
        });
    })
    return queues;
};

