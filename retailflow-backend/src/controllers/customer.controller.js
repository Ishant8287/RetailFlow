import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";
import { cache } from "../utils/cache.js";

export const addCustomer = async (req, res) => {
  try {
    const { name, phone, address, creditLimit = 0 } = req.body;
    const parsedCreditLimit = Number(creditLimit);
    if (!String(name || "").trim() || !String(phone || "").trim()) {
      return res.status(400).json({ success: false, message: "Name and phone are required." });
    }
    if (!Number.isFinite(parsedCreditLimit) || parsedCreditLimit < 0) {
      return res.status(400).json({ success: false, message: "Credit limit must be a non-negative number." });
    }
    const normalizedPhone = String(phone).trim();
    const existing = await Customer.findOne({ phone: normalizedPhone, shop: req.shop.id }).lean();
    if (existing) return res.status(409).json({ success: false, message: "Customer with this phone already exists." });
    const customer = await Customer.create({
      shop: req.shop.id, name: String(name).trim(), phone: normalizedPhone,
      address: address || "", creditLimit: parsedCreditLimit,
    });
    cache.invalidate(`customers:${req.shop.id}`);
    return res.status(201).json({ success: true, data: customer, message: "Customer added!" });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Customer with this phone already exists." });
    console.error("Add customer error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to add customer right now." });
  }
};
export const getCustomers = async (req, res) => {
  try {
    const key = `customers:${req.shop.id}`;
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

    const customers = await Customer.find({ shop: req.shop.id })
      .sort("-createdAt")
      .lean();

    cache.set(key, customers, 60_000); // 60s TTL

    res
      .status(200)
      .json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shop: req.shop.id });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });

    const { totalUdhaar, name, phone, address, creditLimit, paymentAmount, paymentNote } = req.body;
    // Outstanding balance is an accounting ledger: only sale/receipt flows may change it.
    if (totalUdhaar !== undefined) {
      return res.status(400).json({ success: false, message: "Outstanding balance cannot be edited directly. Record a sale or payment instead." });
    }
    if (paymentAmount !== undefined) {
      const amount = Number(paymentAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Payment amount must be a positive number." });
      }
      if (amount > customer.totalUdhaar) {
        return res.status(400).json({ success: false, message: "Payment exceeds outstanding due amount." });
      }
      customer.totalUdhaar -= amount;
      customer.khataHistory.push({ transactionType: "PAYMENT_RECEIVED", amount, description: String(paymentNote || "Manual payment received").trim() });
    }
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ success: false, message: "Customer name cannot be empty." });
      customer.name = String(name).trim();
    }
    if (phone !== undefined) {
      if (!String(phone).trim()) return res.status(400).json({ success: false, message: "Customer phone cannot be empty." });
      customer.phone = String(phone).trim();
    }
    if (address !== undefined) customer.address = address;
    if (creditLimit !== undefined) {
      const parsedLimit = Number(creditLimit);
      if (!Number.isFinite(parsedLimit) || parsedLimit < 0) return res.status(400).json({ success: false, message: "Credit limit must be a non-negative number." });
      if (parsedLimit > 0 && parsedLimit < customer.totalUdhaar) return res.status(400).json({ success: false, message: "Credit limit cannot be lower than the current outstanding balance." });
      customer.creditLimit = parsedLimit;
    }

    await customer.save();
    cache.invalidate(`customers:${req.shop.id}`);
    return res.status(200).json({ success: true, data: customer, message: "Customer updated!" });
  } catch (error) {
    console.error("Update customer error:", error.message);
    const duplicate = error?.code === 11000;
    return res.status(duplicate ? 409 : 500).json({ success: false, message: duplicate ? "Customer with this phone already exists." : "Unable to update customer right now." });
  }
};
export const getCustomerHistory = async (req, res) => {
  try {
    const [customer, sales] = await Promise.all([
      Customer.findOne({ _id: req.params.id, shop: req.shop.id }).lean(),
      Sale.find({ shop: req.shop.id, customer: req.params.id })
        .sort("-createdAt")
        .limit(50)
        .lean(),
    ]);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    const itemFrequency = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.itemId.toString();
        if (!itemFrequency[key]) {
          itemFrequency[key] = {
            name: item.name || "Unknown",
            quantity: 0,
            times: 0,
          };
        }
        itemFrequency[key].quantity += item.quantity;
        itemFrequency[key].times += 1;
      });
    });

    const topItems = Object.values(itemFrequency)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        customer,
        sales,
        topItems,
        totalSpent: sales.reduce((sum, s) => sum + s.totalAmount, 0),
        totalVisits: sales.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleReminder = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      shop: req.shop.id,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    const { scheduledDate } = req.body;

    customer.nextReminderDate = scheduledDate
      ? new Date(scheduledDate)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await customer.save();

    cache.invalidate(`customers:${req.shop.id}`);

    res.status(200).json({
      success: true,
      message: "Reminder scheduled!",
      data: { nextReminderDate: customer.nextReminderDate },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRemindersDue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const customers = await Customer.find({
      shop: req.shop.id,
      totalUdhaar: { $gt: 0 },
      nextReminderDate: { $lte: today },
    }).lean();

    res
      .status(200)
      .json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
