const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis)

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: 6379
})

client.on('connect', () => console.log('Redis client connected'))

module.exports = client;