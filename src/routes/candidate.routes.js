// routes/candidate.routes.js
import express from "express";
import {
  addCandidate,
  quickScan,
  getCandidates,
  getCandidate,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
  bulkUpdateStatus,
  getCandidateAnalytics,
  exportCandidates
} from "../controllers/candidate.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, addCandidate);
router.get("/scan", requireAuth, quickScan);
router.get("/", requireAuth, getCandidates);
router.get("/analytics", requireAuth, getCandidateAnalytics);
router.get("/export", requireAuth, exportCandidates);
router.get("/:id", requireAuth, getCandidate);
router.put("/:id", requireAuth, updateCandidate);
router.put("/:id/status", requireAuth, updateCandidateStatus);
router.delete("/:id", requireAuth, deleteCandidate);
router.post("/bulk/status", requireAuth, bulkUpdateStatus);

export default router;