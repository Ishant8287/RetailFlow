import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./app.js";
import { startReminderCron } from "./src/utils/reminderCron.js";


connectDB();

// Start WhatsApp reminder scheduler
startReminderCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `RetailFlow Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
