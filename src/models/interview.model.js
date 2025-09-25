import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  interviewDate: {
    type: Date,
    required: true
  },
  interviewType: {
    type: String,
    enum: ["behavioral", "technical", "hr", "cultural"],
    required: true
  },
  interviewers: [{
    type: String,
    trim: true
  }],
  meetingLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "no-show"],
    default: "scheduled"
  },
  feedback: {
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
    culturalFit: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    notes: { type: String, trim: true },
    submittedBy: { type: String, trim: true },
    outcome: {
      type: String,
      enum: ["passed", "failed", "pending", "recommended-next-round"]
    },
    submittedAt: { type: Date, default: Date.now }
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

interviewSchema.index({ candidate: 1, interviewDate: -1 });
interviewSchema.index({ interviewDate: 1, status: 1 });

export default mongoose.model("Interview", interviewSchema);