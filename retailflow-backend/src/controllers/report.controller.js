import Sale from "../models/Sale.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res, next) => {
  try {
    const shopId = new mongoose.Types.ObjectId(req.shop.id);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Run all heavy queries IN PARALLEL — not one after another
    const [salesAgg, udhaarAgg, inventoryAgg, expensesAgg, recentSales] =
      await Promise.all([
        // 1. Single aggregation for today + month sales stats
        Sale.aggregate([
          { $match: { shop: shopId } },
          {
            $facet: {
              today: [
                { $match: { createdAt: { $gte: startOfToday } } },
                {
                  $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" },
                    profit: { $sum: "$profit" },
                    count: { $sum: 1 },
                  },
                },
              ],
              month: [
                { $match: { createdAt: { $gte: startOfMonth } } },
                {
                  $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" },
                    profit: { $sum: "$profit" },
                  },
                },
              ],
            },
          },
        ]),

        // 2. Total udhaar across all customers
        Customer.aggregate([
          { $match: { shop: shopId } },
          { $group: { _id: null, total: { $sum: "$totalUdhaar" } } },
        ]),

        // 3. Inventory value
        Item.aggregate([
          { $match: { shop: shopId } },
          { $unwind: "$batches" },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$batches.purchasePrice", "$batches.quantity"],
                },
              },
            },
          },
        ]),

        // 4. Month expenses
        Expense.aggregate([
          { $match: { shop: shopId, date: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // 5. Recent 100 sales only (for the chart/list on dashboard)
        Sale.find({ shop: shopId }).sort({ createdAt: -1 }).limit(100).lean(),
      ]);

    const todayStats = salesAgg[0]?.today?.[0] || {};
    const monthStats = salesAgg[0]?.month?.[0] || {};

    const todaysRevenue = todayStats.revenue || 0;
    const todaysProfit = todayStats.profit || 0;
    const monthRevenue = monthStats.revenue || 0;
    const monthProfit = monthStats.profit || 0;
    const totalSalesCount = todayStats.count || 0;

    const totalUdhaar = udhaarAgg[0]?.total || 0;
    const inventoryValue = inventoryAgg[0]?.total || 0;
    const monthExpenses = expensesAgg[0]?.total || 0;
    const netProfit = monthProfit - monthExpenses;

    res.status(200).json({
      success: true,
      data: {
        todaysRevenue,
        todaysProfit,
        monthRevenue,
        monthProfit,
        netProfit,
        totalUdhaar,
        inventoryValue,
        totalSalesCount,
        sales: recentSales, 
      },
    });
  } catch (error) {
    next(error);
  }
};
