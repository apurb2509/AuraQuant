/**
 * Advanced Market Microstructure Metrics
 */
let lastBestBid = { price: 0, qty: 0 };
let lastBestAsk = { price: 0, qty: 0 };

// VPIN Variables
let volumeBucket = 0;
const BUCKET_SIZE = 50; // Aggregate 50 BTC of volume per VPIN update
let buyVolume = 0;
let sellVolume = 0;
let lastVPIN = 0;

const calculateMetrics = (currentBids, currentAsks) => {
    const bestBidPrice = parseFloat(currentBids[0][0]);
    const bestBidQty = parseFloat(currentBids[0][1]);
    const bestAskPrice = parseFloat(currentAsks[0][0]);
    const bestAskQty = parseFloat(currentAsks[0][1]);

    // 1. OFI Calculation
    let deltaBid = 0;
    if (bestBidPrice > lastBestBid.price) deltaBid = bestBidQty;
    else if (bestBidPrice === lastBestBid.price) deltaBid = bestBidQty - lastBestBid.qty;
    else deltaBid = -lastBestBid.qty;

    let deltaAsk = 0;
    if (bestAskPrice < lastBestAsk.price) deltaAsk = bestAskQty;
    else if (bestAskPrice === lastBestAsk.price) deltaAsk = bestAskQty - lastBestAsk.qty;
    else deltaAsk = -lastBestAsk.qty;

    const ofi = deltaBid - deltaAsk;

    // 2. Micro-Price
    const microPrice = (bestBidPrice * bestAskQty + bestAskPrice * bestBidQty) / (bestBidQty + bestAskQty);

    // 3. VPIN (Simplified for real-time stream)
    // We treat the net OFI as the volume proxy for this tick
    const currentTickVolume = bestBidQty + bestAskQty;
    volumeBucket += currentTickVolume;
    
    // Assign volume to buy/sell based on price movement (Tick Rule)
    if (ofi > 0) buyVolume += currentTickVolume;
    else sellVolume += currentTickVolume;

    if (volumeBucket >= BUCKET_SIZE) {
        lastVPIN = Math.abs(buyVolume - sellVolume) / volumeBucket;
        // Reset bucket
        volumeBucket = 0;
        buyVolume = 0;
        sellVolume = 0;
    }

    lastBestBid = { price: bestBidPrice, qty: bestBidQty };
    lastBestAsk = { price: bestAskPrice, qty: bestAskQty };

    return { 
        ofi: ofi.toFixed(4),        // String
        microPrice: microPrice.toFixed(2), // String
        vpin: lastVPIN.toFixed(4)   // String
    };
};

module.exports = { calculateMetrics };