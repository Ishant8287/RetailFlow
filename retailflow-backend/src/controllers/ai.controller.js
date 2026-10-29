import groq from "../utils/groqClient.js";

const insightCache = new Map();

export const getGeminiInsights = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 8000) {
      return res.status(400).json({
        success: false,
        message: "Prompt must be a non-empty string of at most 8000 characters.",
      });
    }

    const shopId = req.shop.id;
    const normalizedPrompt = prompt.trim();
    const cacheKey = `${shopId}_${normalizedPrompt}`;

    // Remove expired entries and cap cache size to avoid unbounded process memory growth.
    for (const [key, entry] of insightCache.entries()) {
      if (Date.now() - entry.time >= 10 * 60 * 1000) insightCache.delete(key);
    }

    const cached = insightCache.get(cacheKey);
    if (cached && Date.now() - cached.time < 10 * 60 * 1000) {
      return res.status(200).json({
        success: true,
        data: cached.text,
        cached: true,
      });
    }

    console.time("AI Response");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are a helpful business analytics assistant.",
        },
        {
          role: "user",
          content: normalizedPrompt,
        },
      ],
    max_completion_tokens: 1024,
    reasoning_effort: "low",
    include_reasoning: false,
    temperature: 0.7,
    });

    console.timeEnd("AI Response");

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Bound this process-local cache.
    if (insightCache.size >= 500) {
      const oldestKey = insightCache.keys().next().value;
      if (oldestKey !== undefined) insightCache.delete(oldestKey);
    }
    insightCache.set(cacheKey, {
      text: responseText,
      time: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: responseText,
    });
  } catch (error) {
    console.error("AI Error:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI quota exceeded. Try again later.",
      });
    }

    console.error("AI generation failed:", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
    });
    return res.status(500).json({
      success: false,
      message: "Unable to generate AI insight right now. Please try again later.",
    });
  }
};
