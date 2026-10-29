import Expense from "../models/Expense.js";

// @route   POST /api/v1/expenses
export const addExpense = async (req, res) => {
  try {
    const { category, amount, description, date, paymentMethod, receipt } =
      req.body;

    const parsedAmount = Number(amount);
    if (!category || amount === undefined || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "A category and a positive, valid amount are required." });
    }
    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid expense date." });
    }

    const expense = await Expense.create({
      shop: req.shop.id,
      category,
      amount: parsedAmount,
      description: description || "",
      date: parsedDate,
      paymentMethod: paymentMethod || "Cash",
      receipt: receipt || null,
      addedBy: req.staff?._id || req.shop._id,
      addedByModel: req.staff ? "Staff" : "Shop",
    });

    res
      .status(201)
      .json({ success: true, data: expense, message: "Expense recorded!" });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Invalid expense fields." });
    console.error("Add expense error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to record expense right now." });
  }
};

// @route   GET /api/v1/expenses
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = { shop: req.shop.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) return res.status(400).json({ success: false, message: "Invalid startDate." });
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) return res.status(400).json({ success: false, message: "Invalid endDate." });
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (category) query.category = category;

    const expenses = await Expense.find(query).sort("-date");

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category for chart
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      byCategory,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/v1/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      shop: req.shop.id,
    });
    if (!expense)
      return res
        .status(404)
        .json({ success: false, message: "Expense not found." });

    await expense.deleteOne();
    res.status(200).json({ success: true, message: "Expense deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
