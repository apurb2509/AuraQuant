const WebSocket = require('ws');

const initializeMarketData = (io) => {
    const ws = new WebSocket(process.env.EXCHANGE_WS_URL);

    ws.on('open', () => console.log('Connected to Exchange WebSocket'));

    ws.on('message', (data) => {
        const streamData = JSON.parse(data);
        
        // This is the raw "Depth" stream
        // We broadcast it via Socket.io for now to test connectivity
        io.emit('market-update', {
            bids: streamData.b, // Best Bids [Price, Quantity]
            asks: streamData.a, // Best Asks [Price, Quantity]
            timestamp: streamData.E
        });
    });

    ws.on('error', (err) => console.error('WS Error:', err));
};

module.exports = { initializeMarketData };