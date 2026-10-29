import express from "express";
import { getGeminiInsights } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { aiRequestLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/generate", protect, aiRequestLimiter, getGeminiInsights);

export default router;
