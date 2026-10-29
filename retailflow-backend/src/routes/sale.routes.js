import express from "express";
import { createSale, getSales } from "../controllers/sale.controller.js";
import { protect, authorizePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, authorizePermission("canAccessPOS"));

router.route("/").get(getSales).post(createSale);

export default router;
