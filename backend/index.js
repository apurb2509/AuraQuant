require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectRedis } = require('./src/config/redisClient');
const { initializeMarketData } = require('./src/services/marketData');
const { getHistory } = require('./src/services/replayService'); // Import the log parser

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- API Endpoints ---

/**
 * Historical Data Endpoint
 * Returns the recorded market snapshots for backtesting
 */
app.get('/api/history', async (req, res) => {
    try {
        const history = await getHistory();
        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No historical logs found." });
        }
        res.json(history);
    } catch (error) {
        console.error("Backtest API Error:", error);
        res.status(500).json({ error: "Failed to retrieve historical data." });
    }
});

// --- Start Services ---
const startServer = async () => {
    try {
        await connectRedis(); // Connect to Redis LOB Memory Layer
        initializeMarketData(io); // Start live WebSocket & AI stream

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`AuraQuant Backend Heartbeat: ${PORT}`);
        });
    } catch (error) {
        console.error("Server Startup Failure:", error);
    }
};

startServer();