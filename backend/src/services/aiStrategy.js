const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateBrief = async (metrics) => {
  console.log("DEBUG: Sending request to GROQ with metrics:", metrics);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an institutional HFT strategist. Provide one-sentence, highly technical market briefs."
        },
        {
          role: "user",
          content: `Analyze: Micro-Price $${metrics.microPrice}, OFI ${metrics.ofi}, VPIN ${metrics.vpin}. 
          What is the immediate liquidity outlook? (Max 15 words)`
        }
      ],
      model: "llama-3.1-8b-instant", // Updated model name
    });

    const brief = chatCompletion.choices[0]?.message?.content || "ANALYSIS_UNAVAILABLE";
    console.log("DEBUG: Groq Response Received:", brief);
    return brief;
  } catch (error) {
    console.error("ERROR: Groq API Failed:", error.message);
    return "AI_STRATEGY_OFFLINE";
  }
};

module.exports = { generateBrief };