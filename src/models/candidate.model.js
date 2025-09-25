import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["new", "scheduled", "rejected", "hired", "terminated"],
    default: "new"
  },
  source: {
    type: String,
    trim: true
  },
  // resume: {
  //   type: String, // URL to resume file
  //   trim: true
  // },
  notes: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  terminationReason: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Compound index for efficient searching
candidateSchema.index({ email: 1, status: 1 });
candidateSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Candidate", candidateSchema);