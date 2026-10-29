import express from "express";
import {
  addSupplier,
  getSuppliers,
  updateSupplier,
  recordPurchase,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import { protect, authorize, authorizePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect, authorize("owner", "manager"));
router
  .route("/")
  .get(authorizePermission("canAccessInventory"), getSuppliers)
  .post(authorizePermission("canAccessInventory"), addSupplier);
router
  .route("/:id")
  .put(authorizePermission("canAccessInventory"), updateSupplier)
  .delete(authorize("owner"), deleteSupplier);
router.post("/:id/purchase", authorizePermission("canAccessInventory"), recordPurchase);

export default router;
