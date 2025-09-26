import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Create Admin
export const creatAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: { name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin creates HR account
export const registerHR = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Only admin should do this
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "HR already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const hr = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "hr",
    });

    res.status(201).json({ message: "HR account created", hr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login (Admin or HR)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//newly
// Get all HRs (Admin only)
export const getHrs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const hrs = await User.find({ role: 'hr' }).select('-password');
    res.status(200).json(hrs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete HR (Admin only)
export const deleteHr = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const { id } = req.params;
    const hr = await User.findByIdAndDelete(id);
    if (!hr) return res.status(404).json({ message: 'HR not found' });
    res.status(200).json({ message: 'HR deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update HR (Admin only)
export const updateHr = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const updatedHr = await User.findByIdAndUpdate(id, { name, email, password, role }, { new: true, runValidators: true }).select('-password');
    if (!updatedHr) return res.status(404).json({ message: 'HR not found' });
    res.status(200).json({ message: 'HR updated successfully', hr: updatedHr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get latest hr
export const getLatestHrs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const latestHrs = await User.find({ role: 'hr' }).sort({ createdAt: -1 }).limit(3).select('-password');
    if (!latestHrs.length) return res.status(404).json({ message: 'No HRs found' });
    res.status(200).json(latestHrs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};