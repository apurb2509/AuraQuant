const { createClient } = require('redis');

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
    await client.connect();
    console.log('Redis Connected: LOB Memory Layer Active');
};

module.exports = { client, connectRedis };