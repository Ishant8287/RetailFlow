import express from "express";
import { getDashboardStats } from "../controllers/report.controller.js";
import { protect, authorizePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", authorizePermission("canAccessReports"), getDashboardStats);

export default router;
