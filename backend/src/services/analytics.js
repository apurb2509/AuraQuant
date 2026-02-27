/**
 * Calculates Market Microstructure Metrics
 */
let lastBestBid = { price: 0, qty: 0 };
let lastBestAsk = { price: 0, qty: 0 };

const calculateMetrics = (currentBids, currentAsks) => {
    const bestBidPrice = parseFloat(currentBids[0][0]);
    const bestBidQty = parseFloat(currentBids[0][1]);
    const bestAskPrice = parseFloat(currentAsks[0][0]);
    const bestAskQty = parseFloat(currentAsks[0][1]);

    // 1. Order Flow Imbalance (OFI)
    let deltaBid = 0;
    if (bestBidPrice > lastBestBid.price) deltaBid = bestBidQty;
    else if (bestBidPrice === lastBestBid.price) deltaBid = bestBidQty - lastBestBid.qty;
    else deltaBid = -lastBestBid.qty;

    let deltaAsk = 0;
    if (bestAskPrice < lastBestAsk.price) deltaAsk = bestAskQty;
    else if (bestAskPrice === lastBestAsk.price) deltaAsk = bestAskQty - lastBestAsk.qty;
    else deltaAsk = -lastBestAsk.qty;

    const ofi = deltaBid - deltaAsk;

    // 2. Micro-Price Calculation
    // Formula: (BidPrice * AskQty + AskPrice * BidQty) / (BidQty + AskQty)
    const microPrice = (bestBidPrice * bestAskQty + bestAskPrice * bestBidQty) / (bestBidQty + bestAskQty);

    // Update last seen values
    lastBestBid = { price: bestBidPrice, qty: bestBidQty };
    lastBestAsk = { price: bestAskPrice, qty: bestAskQty };

    return { ofi, microPrice: microPrice.toFixed(2) };
};

module.exports = { calculateMetrics };