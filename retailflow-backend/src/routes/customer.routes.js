import express from "express";
import {
  addCustomer,
  getCustomers,
  updateCustomer,
  getCustomerHistory,
  scheduleReminder,
  getRemindersDue,
} from "../controllers/customer.controller.js";
import { protect, authorizePermission, authorizeAnyPermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/reminders-due", authorizePermission("canAccessKhata"), getRemindersDue);

router.route("/").get(authorizeAnyPermission("canAccessKhata", "canAccessPOS"), getCustomers).post(authorizeAnyPermission("canAccessKhata", "canAccessPOS"), addCustomer);

router.route("/:id").put(authorizePermission("canAccessKhata"), updateCustomer);

router.get("/:id/history", authorizePermission("canAccessKhata"), getCustomerHistory);
router.post("/:id/schedule-reminder", authorizePermission("canAccessKhata"), scheduleReminder);

export default router;
