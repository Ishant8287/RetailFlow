import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import Item from "../models/Item.js";
import { cache } from "../utils/cache.js";

// @route   POST /api/v1/suppliers
export const addSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, gstin } = req.body;

    if (!name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Name and phone are required." });
    }

    const supplier = await Supplier.create({
      shop: req.shop.id,
      name,
      phone,
      email: email || "",
      address: address || "",
      gstin: gstin || "",
    });

    cache.invalidate(`suppliers:${req.shop.id}`);

    res
      .status(201)
      .json({ success: true, data: supplier, message: "Supplier added!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/v1/suppliers
export const getSuppliers = async (req, res) => {
  try {
    const key = `suppliers:${req.shop.id}`;
    const cached = cache.get(key);
    if (cached) {
      return res
        .status(200)
        .json({
          success: true,
          count: cached.length,
          data: cached,
          cached: true,
        });
    }

    const suppliers = await Supplier.find({ shop: req.shop.id })
      .sort("-createdAt")
      .lean();

    cache.set(key, suppliers, 60_000);

    res
      .status(200)
      .json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/v1/suppliers/:id
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      shop: req.shop.id,
    });
    if (!supplier)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });

    const allowed = ["name", "phone", "email", "address", "gstin"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) supplier[field] = req.body[field];
    });

    await supplier.save();

    cache.invalidate(`suppliers:${req.shop.id}`);

    res
      .status(200)
      .json({ success: true, data: supplier, message: "Supplier updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/v1/suppliers/:id/purchase
// Records a purchase order from this supplier + updates item stock
export const recordPurchase = async (req, res) => {
  let session;
  try {
    const { items, amountPaid = 0, invoiceNumber, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one purchase line is required." });
    }
    const parsedAmountPaid = Number(amountPaid);
    if (!Number.isFinite(parsedAmountPaid) || parsedAmountPaid < 0) {
      return res.status(400).json({ success: false, message: "Amount paid must be a non-negative number." });
    }
    const lines = [];
    for (const line of items) {
      const quantity = Number(line?.quantity);
      const unitCost = Number(line?.unitCost);
      if (!line || !String(line.name || "").trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitCost) || unitCost < 0) {
        return res.status(400).json({ success: false, message: "Each purchase line needs a name, positive quantity, and non-negative unit cost." });
      }
      if (line.itemId && !mongoose.isValidObjectId(line.itemId)) {
        return res.status(400).json({ success: false, message: "Invalid inventory item in purchase." });
      }
      lines.push({ itemId: line.itemId || null, name: String(line.name).trim(), quantity, unitCost });
    }
    const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    if (!Number.isFinite(totalAmount) || totalAmount < 0 || parsedAmountPaid > totalAmount) {
      return res.status(400).json({ success: false, message: "Amount paid cannot exceed the computed purchase total." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid supplier." });
    }

    session = await mongoose.startSession();
    session.startTransaction();
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: req.shop.id }).session(session);
    if (!supplier) {
      const error = new Error("Supplier not found."); error.statusCode = 404; throw error;
    }

    const itemIds = [...new Set(lines.filter((line) => line.itemId).map((line) => String(line.itemId)))];
    const dbItems = itemIds.length ? await Item.find({ _id: { $in: itemIds }, shop: req.shop.id }).session(session) : [];
    const itemMap = Object.create(null);
    dbItems.forEach((item) => { itemMap[String(item._id)] = item; });
    for (const line of lines) {
      if (!line.itemId) continue; // Manual/non-inventory purchase line
      const item = itemMap[String(line.itemId)];
      if (!item) { const error = new Error("An inventory item was not found in this shop."); error.statusCode = 400; throw error; }
      item.batches.push({
        purchasePrice: line.unitCost,
        sellingPrice: Number(item.batches?.[0]?.sellingPrice || 0),
        quantity: line.quantity,
        addedDate: new Date(),
      });
      item.supplier = supplier._id;
    }

    await Promise.all(dbItems.map((item) => item.save({ session })));
    supplier.purchaseHistory.push({
      items: lines.map(({ name, quantity, unitCost }) => ({ name, quantity, unitCost })),
      totalAmount,
      amountPaid: parsedAmountPaid,
      invoiceNumber: String(invoiceNumber || "").trim(),
      notes: String(notes || "").trim(),
    });
    supplier.totalPurchased += totalAmount;
    supplier.totalDue += totalAmount - parsedAmountPaid;
    await supplier.save({ session });
    await session.commitTransaction();

    cache.invalidate(`suppliers:${req.shop.id}`);
    cache.invalidate(`items:${req.shop.id}`);
    return res.status(201).json({ success: true, data: supplier, message: "Purchase recorded and stock updated!", totalAmount });
  } catch (error) {
    if (session?.inTransaction()) {
      try { await session.abortTransaction(); } catch (abortError) { console.error("Purchase rollback failed:", abortError.message); }
    }
    console.error("Record purchase error:", error.message);
    const status = error.statusCode || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500);
    return res.status(status).json({ success: false, message: status >= 500 ? "Unable to record purchase right now." : error.message });
  } finally {
    if (session) await session.endSession();
  }
};
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      shop: req.shop.id,
    });
    if (!supplier)
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });

    await supplier.deleteOne();

    cache.invalidate(`suppliers:${req.shop.id}`);

    res.status(200).json({ success: true, message: "Supplier deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
