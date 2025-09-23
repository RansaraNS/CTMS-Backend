import express from "express";
import {
  addCandidate,
  quickScan,
  getCandidates,
  getCandidate,
  updateCandidateStatus,
  getCandidateHistory
} from "../controllers/candidate.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, addCandidate);
router.get("/scan", requireAuth, quickScan);
router.get("/", requireAuth, getCandidates);
router.get("/:id", requireAuth, getCandidate);
router.put("/:id/status", requireAuth, updateCandidateStatus);
router.get("/:id/history", requireAuth, getCandidateHistory);

export default router;