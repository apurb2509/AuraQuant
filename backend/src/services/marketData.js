const WebSocket = require('ws');
const fs = require('fs');
const path = require('path'); // Added for path safety
const { updateOrderBook } = require('./lobEngine');
const { calculateMetrics } = require('./analytics');
const { generateBrief } = require('./aiStrategy');

let lastAiUpdate = 0;
let lastLogTime = 0;
let currentAiBrief = "INITIALIZING_STRATEGY_ENGINE...";

const logDir = path.join(__dirname, '../../logs/market_data');
const logFile = path.join(logDir, 'history.jsonl');

// Auto-create directory on startup
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const initializeMarketData = (io) => {
    const ws = new WebSocket(process.env.EXCHANGE_WS_URL);

    ws.on('open', () => console.log('✅ Exchange Feed Connected'));

    ws.on('message', async (data) => {
        try {
            const streamData = JSON.parse(data);
            const symbol = 'BTCUSDT';
            const { b: bids, a: asks } = streamData;

            await updateOrderBook(symbol, bids, asks);
            const { ofi, microPrice, vpin } = calculateMetrics(bids, asks);
            const now = Date.now();

            // 1. AI Logic
            if (now - lastAiUpdate > 30000) {
                lastAiUpdate = now;
                // Verify generateBrief exists before calling
                if (typeof generateBrief === 'function') {
                    generateBrief({ ofi, microPrice, vpin }).then(brief => {
                        currentAiBrief = brief;
                    }).catch(err => {
                        console.error("AI Service Error:", err);
                        currentAiBrief = "AI_STRATEGY_DESYNC";
                    });
                }
            }

            // 2. Logging Logic
            if (now - lastLogTime > 5000) { 
                lastLogTime = now;
                const snapshot = {
                    timestamp: now,
                    ofi,
                    vpin,
                    microPrice,
                    bids: bids.slice(0, 5),
                    asks: asks.slice(0, 5)
                };
                fs.appendFileSync(logFile, JSON.stringify(snapshot) + '\n');
            }

            // 3. Broadcast
            io.emit('market-update', {
                symbol,
                bids: bids.slice(0, 10),
                asks: asks.slice(0, 10),
                ofi,
                microPrice, 
                vpin,
                aiBrief: currentAiBrief,
                timestamp: streamData.E
            });
        } catch (error) {
            console.error('Data Processing Error:', error);
        }
    });

    ws.on('error', (err) => console.error('❌ WS connection error:', err));
};

module.exports = { initializeMarketData };