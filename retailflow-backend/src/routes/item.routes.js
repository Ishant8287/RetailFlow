import express from "express";
import {
  addItem,
  getItems,
  updateItem,
  deleteItem,
  getInventoryStats,
} from "../controllers/item.controller.js";
import { protect, authorize, authorizePermission, authorizeAnyPermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats", authorizePermission("canAccessInventory"), getInventoryStats);

router.route("/").get(authorizeAnyPermission("canAccessInventory", "canAccessPOS"), getItems).post(authorize("owner", "manager"), authorizePermission("canAccessInventory"), addItem); // Cashier can't add items

router
  .route("/:id")
  .put(authorize("owner", "manager"), authorizePermission("canAccessInventory"), updateItem)
  .delete(authorize("owner"), deleteItem); // Only owner can delete

export default router;
