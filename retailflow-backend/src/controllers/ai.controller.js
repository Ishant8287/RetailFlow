import groq from "../utils/groqClient.js";

const insightCache = new Map();

export const getGeminiInsights = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const shopId = req.shop?.id || "default";
    const cacheKey = `${shopId}_${prompt}`;

    // ✅ Cache check
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
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful business analytics assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150, // 🔥 reduced for speed
      temperature: 0.7,
    });

    console.timeEnd("AI Response");

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // ✅ Save in cache
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

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
