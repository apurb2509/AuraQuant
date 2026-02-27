const { client } = require('../config/redisClient');

/**
 * HFT-level Order Book Reconstruction
 * Uses Redis Sorted Sets for O(log(N)) performance.
 */
const updateOrderBook = async (symbol, bids, asks) => {
    const bidKey = `lob:${symbol}:bids`;
    const askKey = `lob:${symbol}:asks`;

    // Process Bids: Highest price is best (Descending)
    for (const [price, qty] of bids) {
        const p = parseFloat(price);
        if (parseFloat(qty) === 0) {
            await client.zRem(bidKey, price);
        } else {
            // Redis scores are used for sorting; value is price:qty string
            await client.zAdd(bidKey, [{ score: p, value: `${price}:${qty}` }]);
        }
    }

    // Process Asks: Lowest price is best (Ascending)
    for (const [price, qty] of asks) {
        const p = parseFloat(price);
        if (parseFloat(qty) === 0) {
            await client.zRem(askKey, price);
        } else {
            await client.zAdd(askKey, [{ score: p, value: `${price}:${qty}` }]);
        }
    }
};

module.exports = { updateOrderBook };