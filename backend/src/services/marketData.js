const WebSocket = require('ws');
const { updateOrderBook } = require('./lobEngine');
const { calculateMetrics } = require('./analytics'); // Import the unified function

const initializeMarketData = (io) => {
    const ws = new WebSocket(process.env.EXCHANGE_WS_URL);

    ws.on('open', () => console.log('✅ Exchange Feed Connected'));

    ws.on('message', async (data) => {
        try {
            const streamData = JSON.parse(data);
            const symbol = 'BTCUSDT';
            const { b: bids, a: asks } = streamData;

            // 1. Update LOB in Redis
            await updateOrderBook(symbol, bids, asks);

            // 2. Calculate Intelligence Metrics (OFI + MicroPrice)
            // This MUST be inside the message loop
            const { ofi, microPrice } = calculateMetrics(bids, asks);

            // 3. Broadcast to Frontend
            io.emit('market-update', {
                symbol,
                bids: bids.slice(0, 10),
                asks: asks.slice(0, 10),
                ofi: ofi.toFixed(4),
                microPrice, 
                timestamp: streamData.E
            });
        } catch (error) {
            console.error('Data Processing Error:', error);
        }
    });

    ws.on('error', (err) => console.error('❌ WS connection error:', err));
};

module.exports = { initializeMarketData };