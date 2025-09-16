import express from "express";
import {creatAdmin, registerHR, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/create-admin",creatAdmin);

// Admin creates HR
router.post("/register-hr", requireAuth, registerHR);

// Login (Admin/HR)
router.post("/login", login);

export default router;
