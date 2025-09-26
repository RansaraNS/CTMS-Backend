import express from "express";
import ReportController from "../controllers/reportgenerate.controller.js";

const router = express.Router();

router.get("/candidates/pdf", ReportController.downloadCandidatesReport);
router.get("/candidates/excel", ReportController.downloadCandidatesExcel);
router.get("/interviews/pdf", ReportController.downloadInterviewsReport);
router.get("/interviews/excel",ReportController.downloadInterviewsExcel);
router.get("/candidate/:candidateId", ReportController.downloadCandidateInterviewsReport);



export default router;
