import dotenv from "dotenv";
dotenv.config();
import Shop from "../models/Shop.js";
import Staff from "../models/Staff.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

const sanitizeShop = (shop) => {
  const obj = shop.toObject ? shop.toObject() : { ...shop };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.__v;
  return obj;
};

const sendEmail = async (to, subject, html) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "RetailFlow <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};

const otpHtml = (rawOtp, title, subtitle) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090b;color:#fff;padding:32px;border-radius:16px;">
    <h2 style="color:#6366f1;">${title}</h2>
    <p>${subtitle}</p>
    <div style="font-size:36px;font-weight:900;color:#6366f1;letter-spacing:8px;padding:16px;background:#1e293b;border-radius:8px;text-align:center;">${rawOtp}</div>
    <p style="color:#94a3b8;font-size:13px;">Valid for 10 minutes. Do not share this with anyone.</p>
    <hr style="border:none;border-top:1px solid #334155;margin:20px 0;">
    <p style="color:#64748b;font-size:12px;text-align:center;">RetailFlow</p>
  </div>
`;

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

export const register = async (req, res) => {
  try {
    const { ownerName, shopName, email, password, phone } = req.body;
    if (!ownerName || !shopName || !email || !password || !phone)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const shopExists = await Shop.findOne({ email }).lean();
    if (shopExists)
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });

    const shop = await Shop.create({
      ownerName,
      shopName,
      email,
      password,
      phone,
    });
    res.status(201).json({
      success: true,
      message: "RetailFlow account created successfully! Please login.",
      data: { id: shop._id, shopName: shop.shopName, email: shop.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { contactMethod, contactValue } = req.body;
    if (contactMethod !== "email") {
      return res.status(400).json({ success: false, message: "Email OTP is supported currently; phone OTP is not configured." });
    }
    const email = String(contactValue || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "A valid email address is required." });

    const shop = await Shop.findOne({ email }).select("+otp +otpExpires +otpPurpose +otpAttempts");
    if (!shop) return res.status(404).json({ success: false, message: "No RetailFlow account found with this email." });

    const rawOtp = generateOtp();
    shop.otp = hashOtp(rawOtp);
    shop.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    shop.otpPurpose = "login";
    shop.otpAttempts = 0;
    await shop.save();

    try {
      await sendEmail(shop.email, "RetailFlow - Your Login OTP", otpHtml(rawOtp, "RetailFlow Login", "Your one-time login OTP is:"));
    } catch (emailError) {
      shop.otp = null;
      shop.otpExpires = null;
      shop.otpPurpose = null;
      shop.otpAttempts = 0;
      await shop.save();
      console.error("Login OTP delivery failed:", emailError.message);
      return res.status(502).json({ success: false, message: "Unable to send OTP right now. Please try again later." });
    }

    return res.status(200).json({ success: true, message: "OTP sent. Check your email." });
  } catch (error) {
    console.error("OTP Send Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { contactMethod, contactValue, otp } = req.body;
    if (!contactMethod || !contactValue || !otp)
      return res
        .status(400)
        .json({ success: false, message: "All fields required." });

    const query =
      contactMethod === "email"
        ? { email: contactValue }
        : { phone: contactValue };

    const shop = await Shop.findOne(query).select("+otp +otpExpires");
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });

    if (!shop.otp || !shop.otpExpires)
      return res.status(400).json({
        success: false,
        message: "No OTP requested. Please request a new one.",
      });

    if (shop.otpExpires < Date.now())
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });

    const isMatch = shop.otp === hashOtp(otp);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });

    shop.otp = null;
    shop.otpExpires = null;
    await shop.save();

    const token = shop.getSignedJwtToken();
    return res.status(200).json({
      success: true,
      token,
      message: "Welcome back to RetailFlow!",
      data: sanitizeShop(shop),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });

    const shop = await Shop.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password.trim(), shop.password);
    console.log(`[PassLogin] ${shop.shopName} — bcrypt: ${isMatch}`);

    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });

    const token = shop.getSignedJwtToken();
    return res.status(200).json({
      success: true,
      token,
      message: "Welcome back to RetailFlow!",
      data: sanitizeShop(shop),
    });
  } catch (error) {
    console.error("Password Login Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const staffLogin = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin)
      return res
        .status(400)
        .json({ success: false, message: "Phone and PIN are required." });

    const staff = await Staff.findOne({ phone }).select("+pin");
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff account not found." });

    if (!staff.isActive)
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact the owner.",
      });

    const isMatch = await bcrypt.compare(pin, staff.pin);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid PIN." });

    const token = staff.getSignedJwtToken();
    return res.status(200).json({
      success: true,
      token,
      message: `Welcome, ${staff.name}!`,
      data: {
        _id: staff._id,
        name: staff.name,
        role: staff.role,
        shopId: staff.shop,
        phone: staff.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });

    const shop = await Shop.findOne({ email });
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });

    const rawOtp = generateOtp();

    shop.otp = hashOtp(rawOtp);
    shop.otpExpires = Date.now() + 10 * 60 * 1000;
    await shop.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent." });

    sendEmail(
      shop.email,
      "RetailFlow - Password Reset OTP",
      otpHtml(
        rawOtp,
        "Reset Your Password",
        "You requested a password reset. Your OTP is:",
      ),
    ).catch((err) => console.error("Reset email failed:", err.message));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });

    const shop = await Shop.findOne({ email }).select(
      "+password +otp +otpExpires",
    );
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });

    if (!shop.otp || !shop.otpExpires)
      return res
        .status(400)
        .json({ success: false, message: "No reset OTP requested." });

    if (shop.otpExpires < Date.now())
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });

    const isMatch = shop.otp === hashOtp(otp);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid OTP." });

    shop.password = newPassword;
    shop.otp = null;
    shop.otpExpires = null;
    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! Please login.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Current and new password are required.",
      });

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });

    const shop = await Shop.findById(req.shop.id).select("+password");
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });

    const isMatch = await bcrypt.compare(currentPassword, shop.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });

    shop.password = newPassword;
    await shop.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // Staff tokens must never receive the owner profile or bank details.
    if (req.staff) {
      return res.status(200).json({
        success: true,
        data: {
          _id: req.staff._id,
          name: req.staff.name,
          phone: req.staff.phone,
          role: req.staff.role,
          shopId: req.shop.id,
          permissions: req.staff.permissions,
        },
      });
    }
    const shop = await Shop.findById(req.shop.id).lean();
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found." });
    return res.status(200).json({ success: true, data: sanitizeShop(shop) });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load profile." });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "ownerName", "shopName", "phone", "avatar", "address", "gstEnabled",
      "gst", "upiId", "bankName", "accountNumber", "ifsc", "signatoryName",
      "designation", "logo", "signature",
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updateData[field] = req.body[field];
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No editable profile fields were provided." });
    }
    const shop = await Shop.findByIdAndUpdate(req.shop.id, updateData, { new: true, runValidators: true });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found." });
    return res.status(200).json({ success: true, message: "Profile updated!", data: sanitizeShop(shop) });
  } catch (error) {
    console.error("Profile Update Error:", error.message);
    return res.status(400).json({ success: false, message: "Unable to update profile. Check the submitted fields." });
  }
};
