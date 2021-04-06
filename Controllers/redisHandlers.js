const client = require('../redisClient');

module.exports = {
  set: async (key, value) => {
    return client.setAsync(key, value)
  },
  get: async (key) => {
    return client.getAsync(key)
  },
  del: async (key) => {
    client.delAsync(key)
  },
  hkeys: async (hash) => {
    return client.hkeysAsync(hash)
  },
  hget: async (hash, field) => {
    return client.hgetAsync(hash, field)
  },
  hset: (hash, field, value) => {
    return client.hsetAsync(hash, field, value)
  },
  incr: async (key) => {
    return client.incrAsync(key)
  }
}