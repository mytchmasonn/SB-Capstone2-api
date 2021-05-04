import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import * as cors from "cors";
import * as express from "express";
// ================================================== //
import s3Routes from "./routes/s3Routes";
import pdfRoutes from "./routes/pdfRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import verifyRoutes from "./routes/verifyRoutes";
import miscRoutes from "./routes/miscRoutes";
// ================================================== //

import { PoolClient } from "pg";
import { CurrentUser } from "../types/CurrentUser";
declare global {
  namespace Express {
    interface Request {
      db: PoolClient;
      user: CurrentUser;
    }
  }
}
// ================================================== //

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/files", s3Routes);
app.use("/verify", verifyRoutes);
app.use("/convert", pdfRoutes);
app.use("/misc", miscRoutes);

// listener
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
