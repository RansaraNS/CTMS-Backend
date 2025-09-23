import express from "express";
import {
  getDashboardStats,
  getCandidateReports,
  getInterviewReports,
  getRejectedCandidatesReport
} from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getDashboardStats);
router.get("/candidates", requireAuth, getCandidateReports);
router.get("/interviews", requireAuth, getInterviewReports);
router.get("/rejected", requireAuth, getRejectedCandidatesReport);

export default router;