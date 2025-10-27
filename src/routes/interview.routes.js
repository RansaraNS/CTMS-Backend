// In your interview.routes.js
import express from "express";
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewFeedback,
  cancelInterview,
  rescheduleInterview,
  getUpcomingInterviews,
  deleteInterview 
} from "../controllers/interview.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, scheduleInterview);
router.get("/", requireAuth, getInterviews);
router.get("/upcoming", requireAuth, getUpcomingInterviews);
router.get("/:id", requireAuth, getInterviewById);
router.put("/:id/feedback", requireAuth, updateInterviewFeedback);
router.put("/:id/cancel", requireAuth, cancelInterview);
router.put("/:id/reschedule", requireAuth, rescheduleInterview);
router.delete("/:id", requireAuth, deleteInterview); 

export default router;