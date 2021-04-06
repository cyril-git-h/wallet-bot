const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis)

const client = redis.createClient()


client.on('connect', () => console.log('Redis client connected'))

module.exports = client;