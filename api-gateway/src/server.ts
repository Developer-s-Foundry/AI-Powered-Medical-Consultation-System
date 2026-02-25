import express, { Application } from "express";
import dotenv from "dotenv";
import { apiMiddleware } from "./middleware/gateway-middleware";
import cors from "cors";

dotenv.config();
const app: Application = express();

// Enable CORS at the very top, before routes/middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Allow all origins (you can specify specific origins if needed)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  }),
);

app.use(express.json());

app.use(apiMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
