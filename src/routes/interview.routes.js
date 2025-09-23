import express from "express";
import {
  scheduleInterview,
  getInterviews,
  updateInterviewFeedback,
  cancelInterview
} from "../controllers/interview.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, scheduleInterview);
router.get("/", requireAuth, getInterviews);
router.put("/:id/feedback", requireAuth, updateInterviewFeedback);
router.put("/:id/cancel", requireAuth, cancelInterview);

export default router;