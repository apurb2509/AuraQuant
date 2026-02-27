/**
 * Calculates Order Flow Imbalance (OFI)
 * OFI = ΔBestBidQty - ΔBestAskQty
 */
let lastBestBid = { price: 0, qty: 0 };
let lastBestAsk = { price: 0, qty: 0 };

const calculateOFI = (currentBids, currentAsks) => {
    const bestBid = { price: parseFloat(currentBids[0][0]), qty: parseFloat(currentBids[0][1]) };
    const bestAsk = { price: parseFloat(currentAsks[0][0]), qty: parseFloat(currentAsks[0][1]) };

    let deltaBid = 0;
    if (bestBid.price > lastBestBid.price) deltaBid = bestBid.qty;
    else if (bestBid.price === lastBestBid.price) deltaBid = bestBid.qty - lastBestBid.qty;
    else deltaBid = -lastBestBid.qty;

    let deltaAsk = 0;
    if (bestAsk.price < lastBestAsk.price) deltaAsk = bestAsk.qty;
    else if (bestAsk.price === lastBestAsk.price) deltaAsk = bestAsk.qty - lastBestAsk.qty;
    else deltaAsk = -lastBestAsk.qty;

    // Store current for next tick comparison
    lastBestBid = bestBid;
    lastBestAsk = bestAsk;

    return deltaBid - deltaAsk;
};

module.exports = { calculateOFI };