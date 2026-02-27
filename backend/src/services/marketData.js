const WebSocket = require('ws');
const { updateOrderBook } = require('./lobEngine');

const initializeMarketData = (io) => {
    const ws = new WebSocket(process.env.EXCHANGE_WS_URL);

    ws.on('open', () => console.log('✅ Exchange Feed Connected'));

    ws.on('message', async (data) => {
        try {
            const streamData = JSON.parse(data);
            const symbol = 'BTCUSDT';

            // 'b' is bids, 'a' is asks in Binance stream
            const { b: bids, a: asks } = streamData;

            // 1. Update the Memory Layer (Redis)
            await updateOrderBook(symbol, bids, asks);

            // 2. Push top 10 levels to Frontend via Socket.io
            io.emit('market-update', {
                symbol,
                bids: bids.slice(0, 10),
                asks: asks.slice(0, 10),
                timestamp: streamData.E
            });
        } catch (error) {
            console.error('Data Processing Error:', error);
        }
    });

    ws.on('error', (err) => console.error('❌ WS connection error:', err));
};

module.exports = { initializeMarketData };