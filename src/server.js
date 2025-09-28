import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import candidateRoutes from "./routes/candidate.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import reportgenerateRoutes from "./routes/reportgenerate.routes.js";
import path from "path";

// import reportRoutes from "./routes/report.routes.js";


dotenv.config();
connectDB();


const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/assets",express.static("./src/public"));
app.use("/api/report",reportgenerateRoutes);
app.use("/uploads/cv", express.static(path.join("uploads", "cv")));


// app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "CTMS API is running successfully" });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));