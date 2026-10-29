import express from "express";
import {
  addExpense,
  getExpenses,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { protect, authorize, authorizePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect, authorizePermission("canAccessExpenses"));
router.route("/").get(getExpenses).post(addExpense);
router.delete("/:id", authorize("owner", "manager"), deleteExpense);

export default router;
