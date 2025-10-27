import express from "express";
import { creatAdmin, registerHR, login, getHrs, deleteHr, updateHr, getLatestHrs } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-admin", creatAdmin);

// Admin creates HR
router.post("/register-hr", requireAuth, registerHR);

// Login (Admin/HR)
router.post("/login", login);


//new
// Get all HRs (Admin only)
router.get("/hrs", requireAuth, getHrs);

// Delete HR (Admin only)
router.delete("/hrs/:id", requireAuth, deleteHr);

// Update HR (Admin only)
router.put("/hrs/:id", requireAuth, updateHr);

// get latest hr 
router.get("/latest-hrs", requireAuth, getLatestHrs);

export default router;