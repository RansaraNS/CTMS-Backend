// // // routes/candidate.routes.js
// // import express from "express";
// // import {
// //   addCandidate,
// //   quickScan,
// //   getCandidates,
// //   getCandidate,
// //   updateCandidate,
// //   updateCandidateStatus,
// //   deleteCandidate,
// //   bulkUpdateStatus,
// //   getCandidateAnalytics,
// //   exportCandidates,
// //   getDashboardStats,
// //   getCandidatesWithoutInterviews,
// //   getNewCandidates
// // } from "../controllers/candidate.controller.js";
// // import { requireAuth } from "../middleware/auth.middleware.js";
// // import upload, { handleUploadError } from "../middleware/upload.js";


// // const router = express.Router();

// // // // router.post("/", requireAuth, addCandidate);
// // // router.post("/", requireAuth, upload.single("cv"), addCandidate);

// // // router.get("/scan", requireAuth, quickScan);
// // // router.get("/", requireAuth, getCandidates);
// // // router.get("/status/new", requireAuth, getNewCandidates);
// // // router.get("/analytics", requireAuth, getCandidateAnalytics);
// // // router.get("/dashboard/stats", requireAuth, getDashboardStats);
// // // router.get("/export", requireAuth, exportCandidates);
// // // router.get("/:id", requireAuth, getCandidate);
// // // router.put("/:id", requireAuth, updateCandidate);
// // // router.put("/:id/status", requireAuth, updateCandidateStatus);
// // // router.delete("/:id", requireAuth, deleteCandidate);
// // // router.post("/bulk/status", requireAuth, bulkUpdateStatus);
// // // router.get("/available-candidates", requireAuth, getCandidatesWithoutInterviews);

// // router.post("/", requireAuth, upload.single("cv"), handleUploadError,addCandidate);

// // router.get("/scan", requireAuth, quickScan);
// // router.get("/", requireAuth, getCandidates);
// // router.get("/status/new", requireAuth, getNewCandidates);
// // router.get("/analytics", requireAuth, getCandidateAnalytics);
// // router.get("/dashboard/stats", requireAuth, getDashboardStats);
// // router.get("/export", requireAuth, exportCandidates);
// // router.post("/bulk/status", requireAuth, bulkUpdateStatus);
// // router.get("/available-candidates", requireAuth, getCandidatesWithoutInterviews);

// // // ⚠️ keep this LAST
// // router.get("/:id", requireAuth, getCandidate);
// // router.put("/:id", requireAuth, upload.single("cv"), handleUploadError,updateCandidate);
// // router.put("/:id/status", requireAuth, updateCandidateStatus);
// // router.delete("/:id", requireAuth, deleteCandidate);



// // export default router;


// import express from "express";
// import {
//   addCandidate,
//   quickScan,
//   getCandidates,
//   getCandidate,
//   updateCandidate,
//   updateCandidateStatus,
//   deleteCandidate,
//   bulkUpdateStatus,
//   getCandidateAnalytics,
//   exportCandidates,
//   getDashboardStats,
//   getCandidatesWithoutInterviews,
//   getNewCandidates,
//   getCandidateCV // Add this import
// } from "../controllers/candidate.controller.js";
// import { requireAuth } from "../middleware/auth.middleware.js";
// import upload, { handleUploadError } from "../middleware/upload.js";

// const router = express.Router();

// router.post("/", requireAuth, upload.single("cv"), handleUploadError, addCandidate);
// router.get("/scan", requireAuth, quickScan);
// router.get("/", requireAuth, getCandidates);
// router.get("/status/new", requireAuth, getNewCandidates);
// router.get("/analytics", requireAuth, getCandidateAnalytics);
// router.get("/dashboard/stats", requireAuth, getDashboardStats);
// router.get("/export", requireAuth, exportCandidates);
// router.post("/bulk/status", requireAuth, bulkUpdateStatus);
// router.get("/available-candidates", requireAuth, getCandidatesWithoutInterviews);

// // CV download route - add this before the :id routes
// router.get("/:id/cv", requireAuth, getCandidateCV);

// // Keep these last
// router.get("/:id", requireAuth, getCandidate);
// router.put("/:id", requireAuth, upload.single("cv"), handleUploadError, updateCandidate);
// router.put("/:id/status", requireAuth, updateCandidateStatus);
// router.delete("/:id", requireAuth, deleteCandidate);

// export default router;


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
  exportCandidates,
  getDashboardStats,
  getCandidatesWithoutInterviews,
  getNewCandidates,
  getCandidateCV // Make sure this is imported
} from "../controllers/candidate.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import upload, { handleUploadError } from "../middleware/upload.js";

const router = express.Router();

router.post("/", requireAuth, upload.single("cv"), handleUploadError, addCandidate);
router.get("/scan", requireAuth, quickScan);
router.get("/", requireAuth, getCandidates);
router.get("/status/new", requireAuth, getNewCandidates);
router.get("/analytics", requireAuth, getCandidateAnalytics);
router.get("/dashboard/stats", requireAuth, getDashboardStats);
router.get("/export", requireAuth, exportCandidates);
router.post("/bulk/status", requireAuth, bulkUpdateStatus);
router.get("/available-candidates", requireAuth, getCandidatesWithoutInterviews);

// CV download route - add this before the :id routes
router.get("/:id/cv", requireAuth, getCandidateCV);

// Keep these last
router.get("/:id", requireAuth, getCandidate);
router.put("/:id", requireAuth, upload.single("cv"), handleUploadError, updateCandidate);
router.put("/:id/status", requireAuth, updateCandidateStatus);
router.delete("/:id", requireAuth, deleteCandidate);

export default router;