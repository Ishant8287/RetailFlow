import express from "express";
import { createSale, getSales } from "../controllers/sale.controller.js";
import { protect, authorizePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizePermission("canAccessReports"), getSales);
router.post("/", authorizePermission("canAccessPOS"), createSale);

export default router;
