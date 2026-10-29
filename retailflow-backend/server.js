import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import app from "./app.js";
import { startReminderCron } from "./src/utils/reminderCron.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Do not run jobs or accept requests before the database is ready.
  await connectDB();
  startReminderCron();

  app.listen(PORT, () => {
    console.log(`RetailFlow Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

startServer().catch((error) => {
  console.error("RetailFlow startup failed:", error.message);
  process.exit(1);
});
