import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import { cache } from "../utils/cache.js";

const requestError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// @desc Get sales scoped to the authenticated shop
// @route GET /api/v1/sales
export const getSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const parsedLimit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ success: false, message: "Limit must be an integer between 1 and 100." });
    }

    const query = { shop: req.shop.id };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) return res.status(400).json({ success: false, message: "Invalid startDate." });
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) return res.status(400).json({ success: false, message: "Invalid endDate." });
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
      if (query.createdAt.$gte && query.createdAt.$lte && query.createdAt.$gte > query.createdAt.$lte) {
        return res.status(400).json({ success: false, message: "startDate must be before endDate." });
      }
    }

    const cacheable = !startDate && !endDate;
    const key = `sales:${req.shop.id}:limit:${parsedLimit}`;
    if (cacheable) {
      const cached = cache.get(key);
      if (cached) return res.status(200).json({ success: true, count: cached.length, data: cached, cached: true });
    }

    const sales = await Sale.find(query).sort("-createdAt").limit(parsedLimit).lean();
    if (cacheable) cache.set(key, sales, 30_000);
    return res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    console.error("Get sales error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load sales right now." });
  }
};

// @desc Create a sale using prices and stock stored by the server
// @route POST /api/v1/sales
export const createSale = async (req, res) => {
  let session;
  try {
    const { customer, items, paymentSplit } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one sale item is required." });
    }
    if (!paymentSplit || typeof paymentSplit !== "object" || Array.isArray(paymentSplit)) {
      return res.status(400).json({ success: false, message: "Payment details are required." });
    }

    const split = {
      cash: Number(paymentSplit.cash ?? 0),
      upi: Number(paymentSplit.upi ?? 0),
      udhaar: Number(paymentSplit.udhaar ?? 0),
    };
    if (Object.values(split).some((amount) => !Number.isFinite(amount) || amount < 0)) {
      return res.status(400).json({ success: false, message: "Payment amounts must be valid non-negative numbers." });
    }
    if (split.udhaar > 0 && !customer) {
      return res.status(400).json({ success: false, message: "Select a customer before recording udhaar." });
    }
    if (customer && !mongoose.isValidObjectId(customer)) {
      return res.status(400).json({ success: false, message: "Invalid customer." });
    }

    for (const orderItem of items) {
      if (!orderItem || !mongoose.isValidObjectId(orderItem.itemId) || !mongoose.isValidObjectId(orderItem.batchId)) {
        return res.status(400).json({ success: false, message: "Each item must include a valid itemId and batchId." });
      }
      const quantity = Number(orderItem.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Item quantities must be positive numbers." });
      }
    }

    session = await mongoose.startSession();
    session.startTransaction();

    let dbCustomer = null;
    if (customer) {
      dbCustomer = await Customer.findOne({ _id: customer, shop: req.shop.id }).session(session);
      if (!dbCustomer) throw requestError("Customer not found in this shop.");
    }
    if (split.udhaar > 0 && dbCustomer && dbCustomer.creditLimit > 0) {
      if (dbCustomer.totalUdhaar + split.udhaar > dbCustomer.creditLimit) {
        throw requestError("Credit limit exceeded.");
      }
    }

    const itemIds = [...new Set(items.map((item) => String(item.itemId)))];
    const dbItems = await Item.find({ _id: { $in: itemIds }, shop: req.shop.id }).session(session);
    const itemMap = Object.create(null);
    for (const item of dbItems) itemMap[String(item._id)] = item;

    let totalAmount = 0;
    let totalPurchasePrice = 0;
    const saleItems = [];

    for (const orderItem of items) {
      const item = itemMap[String(orderItem.itemId)];
      if (!item) throw requestError("An item was not found in this shop.");
      const batch = item.batches.id(orderItem.batchId);
      const quantity = Number(orderItem.quantity);
      if (!batch || !Number.isFinite(Number(batch.quantity)) || batch.quantity < quantity) {
        throw requestError(`Insufficient stock for: ${item.name}`);
      }
      const sellingPrice = Number(batch.sellingPrice);
      const purchasePrice = Number(batch.purchasePrice || 0);
      if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
        throw requestError(`Invalid price data for: ${item.name}`, 400);
      }

      batch.quantity -= quantity;
      totalAmount += sellingPrice * quantity;
      totalPurchasePrice += purchasePrice * quantity;
      saleItems.push({
        itemId: item._id,
        batchId: batch._id,
        name: item.name,
        quantity,
        sellingPrice,
        purchasePrice,
      });
    }

    const totalPaid = split.cash + split.upi + split.udhaar;
    if (Math.round(totalPaid * 100) !== Math.round(totalAmount * 100)) {
      throw requestError("Payment split must equal the sale total.");
    }

    // Keep transaction writes sequential; parallel operations in a MongoDB transaction are unsupported.
    for (const item of dbItems) await item.save({ session });
    const sale = new Sale({
      shop: req.shop.id,
      customer: dbCustomer?._id || null,
      items: saleItems,
      totalAmount,
      totalPurchasePrice,
      profit: totalAmount - totalPurchasePrice,
      paymentSplit: split,
    });
    await sale.save({ session });

    if (split.udhaar > 0 && dbCustomer) {
      dbCustomer.totalUdhaar += split.udhaar;
      dbCustomer.khataHistory.push({
        transactionType: "GIVEN_UDHAAR",
        amount: split.udhaar,
        description: `Invoice: ${sale.invoiceNumber}`,
      });
      await dbCustomer.save({ session });
    }

    await session.commitTransaction();
    cache.invalidate(`sales:${req.shop.id}`);
    cache.invalidate(`items:${req.shop.id}`);
    cache.invalidate(`dashboard:${req.shop.id}`);
    if (customer) cache.invalidate(`customers:${req.shop.id}`);

    return res.status(201).json({ success: true, message: "Sale completed!", data: sale });
  } catch (error) {
    if (session?.inTransaction()) {
      try { await session.abortTransaction(); } catch (abortError) { console.error("Sale rollback failed:", abortError.message); }
    }
    console.error("Create sale error:", error.message);
    const status = error.statusCode || (error.name === "ValidationError" || error.name === "CastError" || error.code === 11000 ? 400 : 500);
    return res.status(status).json({
      success: false,
      message: status >= 500 ? "Unable to complete the sale right now." : error.message,
    });
  } finally {
    if (session) await session.endSession();
  }
};
