const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Historical Log Parser
 * Reads the .jsonl file line-by-line to avoid memory overflow
 */
const getHistory = async () => {
    const logPath = path.join(__dirname, '../../logs/market_data/history.jsonl');
    const history = [];
    
    if (!fs.existsSync(logPath)) {
        console.log("⚠️ No history file found at:", logPath);
        return [];
    }

    try {
        const fileStream = fs.createReadStream(logPath);
        const rl = readline.createInterface({ 
            input: fileStream, 
            crlfDelay: Infinity 
        });

        for await (const line of rl) {
            if (line.trim()) {
                history.push(JSON.parse(line));
            }
        }
        return history;
    } catch (error) {
        console.error("Failed to parse history logs:", error);
        return [];
    }
};

module.exports = { getHistory };