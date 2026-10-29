import express from "express";
import ImageKit from "imagekit";
import {
  register,
  sendOtp,
  verifyOtp,
  staffLogin,
  getMe,
  updateProfile,
  loginWithPassword,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { authAttemptLimiter, otpRequestLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/imagekit-auth", (req, res) => {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/register", authAttemptLimiter, register);
router.post("/send-otp", otpRequestLimiter, sendOtp);
router.post("/verify-otp", authAttemptLimiter, verifyOtp);
router.post("/staff-login", authAttemptLimiter, staffLogin);
router.post("/login-password", authAttemptLimiter, loginWithPassword);
router.post("/forgot-password", otpRequestLimiter, forgotPassword);
router.post("/reset-password", authAttemptLimiter, resetPassword);

router.get("/me", protect, getMe);
router.put("/profile", protect, authorize("owner"), updateProfile);
router.put("/change-password", protect, authorize("owner"), changePassword);

export default router;
