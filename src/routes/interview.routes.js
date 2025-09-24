import express from "express";
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewFeedback,
  cancelInterview,
  rescheduleInterview
} from "../controllers/interview.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, scheduleInterview);
router.get("/", requireAuth, getInterviews);
router.get("/:id", requireAuth, getInterviewById);
router.put("/:id/feedback", requireAuth, updateInterviewFeedback);
router.put("/:id/cancel", requireAuth, cancelInterview);
router.put("/:id/reschedule", requireAuth, rescheduleInterview);

export default router;