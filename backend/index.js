require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectRedis } = require('./src/config/redisClient'); // New
const { initializeMarketData } = require('./src/services/marketData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Start Services
const startServer = async () => {
    await connectRedis(); // Connect to Redis first
    initializeMarketData(io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`AuraQuant Backend Heartbeat: ${PORT}`);
    });
};

startServer();