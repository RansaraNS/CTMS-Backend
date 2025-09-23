import Interview from "../models/interview.model.js";
import Candidate from "../models/candidate.model.js";
import sendEmail from "../utils/sendEmail.js";



// Schedule new interview
export const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const interview = await Interview.create({
      candidate: candidateId,
      scheduledBy: req.user._id,
      interviewDate,
      interviewType,
      interviewers,
      meetingLink
    });

    // Update candidate status
    candidate.status = "interviewed";
    candidate.lastUpdatedBy = req.user._id;
    await candidate.save();

    // Send email notification (optional)
    try {
      await sendInterviewInvitation(candidate, interview);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send interview invitation email
const sendInterviewInvitation = async (candidate, interview) => {
  const subject = `Interview Invitation - ${candidate.position}`;
  const html = `
    <h2>Interview Invitation</h2>
    <p>Dear ${candidate.firstName},</p>
    <p>You have been scheduled for an interview.</p>
    <p><strong>Position:</strong> ${candidate.position}</p>
    <p><strong>Date & Time:</strong> ${interview.interviewDate.toLocaleString()}</p>
    <p><strong>Type:</strong> ${interview.interviewType}</p>
    ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">Join Meeting</a></p>` : ''}
    <p>Best regards,<br>HR Team</p>
  `;

  await sendEmail(candidate.email, subject, "", html);
};


// Get all interviews
export const getInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.interviewDate = { $gte: startDate, $lt: endDate };
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'firstName lastName email position')
      .populate('scheduledBy', 'name email')
      .sort({ interviewDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update interview feedback
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { feedback, outcome } = req.body;

    const interview = await Interview.findById(req.params.id)
      .populate('candidate');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "completed";
    interview.feedback = feedback;
    interview.feedback.outcome = outcome;

    await interview.save();

    // Update candidate status based on outcome
    if (outcome === "passed" || outcome === "recommended-next-round") {
      interview.candidate.status = "interviewed";
    } else if (outcome === "failed") {
      interview.candidate.status = "rejected";
      interview.candidate.rejectionReason = "Failed interview";
    }

    interview.candidate.lastUpdatedBy = req.user._id;
    await interview.candidate.save();

    res.json({ message: "Interview feedback updated successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "cancelled";
    await interview.save();

    res.json({ message: "Interview cancelled successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};