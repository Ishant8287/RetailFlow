import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";

// @desc    Get all sales for the shop
// @route   GET /api/v1/sales

export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = { shop: req.shop.id };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sales = await Sale.find(query)
      .sort("-createdAt")
      .limit(limit ? parseInt(limit) : 50);

    res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Sale
// @route   POST /api/v1/sales
export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, paymentSplit, totalPurchasePrice } = req.body;

    // Validate credit limit before processing
    if (paymentSplit.udhaar > 0 && customer) {
      const dbCustomer = await Customer.findById(customer).session(session);
      if (dbCustomer && dbCustomer.creditLimit > 0) {
        const projectedUdhaar = dbCustomer.totalUdhaar + paymentSplit.udhaar;
        if (projectedUdhaar > dbCustomer.creditLimit) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: `Credit limit exceeded! ${dbCustomer.name} can only take ₹${dbCustomer.creditLimit - dbCustomer.totalUdhaar} more on credit.`,
          });
        }
      }
    }

    let totalAmount = 0;
    let calculatedPurchasePrice = 0;

    // Stock deduction
    for (let orderItem of items) {
      const item = await Item.findOne({
        _id: orderItem.itemId,
        shop: req.shop.id,
      }).session(session);

      if (!item) throw new Error(`Item not found in your inventory.`);

      const batch = item.batches.id(orderItem.batchId);
      if (!batch || batch.quantity < orderItem.quantity) {
        throw new Error(`Insufficient stock for: ${item.name}`);
      }

      batch.quantity -= orderItem.quantity;
      await item.save({ session });

      totalAmount += orderItem.sellingPrice * orderItem.quantity;
      calculatedPurchasePrice +=
        (orderItem.purchasePrice || batch.purchasePrice || 0) *
        orderItem.quantity;
    }

    // Payment validation
    const totalPaid =
      (paymentSplit.cash || 0) +
      (paymentSplit.upi || 0) +
      (paymentSplit.udhaar || 0);
    if (Math.round(totalPaid * 100) !== Math.round(totalAmount * 100)) {
      throw new Error(
        `Payment split (₹${totalPaid}) doesn't match total (₹${totalAmount}).`,
      );
    }

    const finalPurchasePrice = totalPurchasePrice || calculatedPurchasePrice;
    const profit = totalAmount - finalPurchasePrice;

    
    const sale = new Sale({
      shop: req.shop.id,
      customer: customer || null,
      items: items.map((i) => ({
        itemId: i.itemId,
        batchId: i.batchId,
        name: i.name,
        quantity: i.quantity,
        sellingPrice: i.sellingPrice,
        purchasePrice: i.purchasePrice || 0,
      })),
      totalAmount,
      totalPurchasePrice: finalPurchasePrice,
      profit,
      paymentSplit: {
        cash: paymentSplit.cash || 0,
        upi: paymentSplit.upi || 0,
        udhaar: paymentSplit.udhaar || 0,
      },
    });

    await sale.save({ session });

    // Khata update
    if (paymentSplit.udhaar > 0) {
      if (!customer) throw new Error("Customer is required for Udhaar sales.");

      const dbCustomer = await Customer.findById(customer).session(session);
      if (!dbCustomer) throw new Error("Customer not found.");

      dbCustomer.totalUdhaar += paymentSplit.udhaar;
      dbCustomer.khataHistory.push({
        transactionType: "GIVEN_UDHAAR",
        amount: paymentSplit.udhaar,
        description: `Invoice: ${sale.invoiceNumber}`,
      });
      await dbCustomer.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Sale completed! 🧾",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
