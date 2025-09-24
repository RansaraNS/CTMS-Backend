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

    // Send interview scheduled email
    try {
      const interviewDateFormatted = new Date(interviewDate).toLocaleString();
      const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">Interview Scheduled</h2>
          <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
          <p>Your interview has been scheduled with the following details:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Position:</strong> ${candidate.position}</p>
            <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
            <p><strong>Interview Type:</strong> ${interviewType}</p>
            <p><strong>Interviewers:</strong> ${interviewers.join(', ')}</p>
            ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
          </div>
          <p>Please make sure to be available at the scheduled time.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `;
      
      await sendEmail(candidate.email, subject, '', html);
    } catch (emailError) {
      console.error('Failed to send interview scheduled email:', emailError);
    }

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update interview feedback with email notifications
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { feedback, outcome } = req.body;

    const interview = await Interview.findById(req.params.id)
      .populate('candidate');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "completed";
    
    if (feedback) {
      interview.feedback = {
        ...interview.feedback,
        ...feedback,
        submittedAt: new Date()
      };
    }
    
    if (outcome) {
      interview.feedback = interview.feedback || {};
      interview.feedback.outcome = outcome;
    }

    await interview.save();

    // Update candidate status based on outcome and send appropriate email
    if (interview.candidate) {
      let emailSubject = '';
      let emailHtml = '';
      let candidateStatus = '';

      if (outcome === "passed") {
        candidateStatus = "hired";
        emailSubject = `Congratulations! You've Been Hired - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Congratulations! You're Hired! 🎉</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>We are thrilled to inform you that you have successfully passed the interview process!</p>
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #065f46;">Offer Details:</h3>
              <p><strong>Position:</strong> ${interview.candidate.position}</p>
              <p><strong>Status:</strong> Hired</p>
              <p>Our HR team will contact you shortly with the formal offer letter and next steps.</p>
            </div>
            <p>Welcome to the team! We're excited to have you on board.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;
      } 
      else if (outcome === "recommended-next-round") {
        candidateStatus = "interviewed";
        emailSubject = `Next Round Interview - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">Next Round Interview</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>Congratulations! You have been recommended for the next round of interviews.</p>
            <div style="background-color: #e0f2fe; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Current Status:</strong> Recommended for Next Round</p>
              <p>Our team will contact you soon to schedule the next interview.</p>
            </div>
            <p>Please keep an eye on your email for further updates.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;
      } 
      else if (outcome === "failed") {
        candidateStatus = "rejected";
        interview.candidate.rejectionReason = "Failed interview";
        emailSubject = `Interview Update - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Interview Update</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>Thank you for taking the time to interview with us.</p>
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
              <p>We appreciate your interest in our company and encourage you to apply for future positions that match your skills and experience.</p>
            </div>
            <p>We wish you the best in your job search.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;
      }
      else {
        candidateStatus = "interviewed";
        emailSubject = `Interview Completed - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">Interview Completed</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>Your interview has been completed and is under review.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Status:</strong> Under Review</p>
              <p>We will contact you soon with the final decision.</p>
            </div>
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;
      }

      interview.candidate.status = candidateStatus;
      interview.candidate.lastUpdatedBy = req.user._id;
      await interview.candidate.save();

      // Send outcome email
      try {
        await sendEmail(interview.candidate.email, emailSubject, '', emailHtml);
      } catch (emailError) {
        console.error('Failed to send outcome email:', emailError);
      }
    }

    res.json({ message: "Interview feedback updated successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel interview with email notification
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate');
      
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "cancelled";
    await interview.save();

    // Send cancellation email
    try {
      const subject = `Interview Cancelled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Interview Cancelled</h2>
          <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
          <p>We regret to inform you that your scheduled interview has been cancelled.</p>
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Original Interview Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
            <p><strong>Position:</strong> ${interview.candidate.position}</p>
          </div>
          <p>We apologize for any inconvenience this may cause. Our team will contact you if we need to reschedule.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `;
      
      await sendEmail(interview.candidate.email, subject, '', html);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({ message: "Interview cancelled successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reschedule interview with email notification
export const rescheduleInterview = async (req, res) => {
  try {
    const { interviewDate, meetingLink } = req.body;

    const interview = await Interview.findById(req.params.id)
      .populate('candidate');
      
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const oldDate = interview.interviewDate;
    interview.interviewDate = interviewDate || interview.interviewDate;
    interview.meetingLink = meetingLink || interview.meetingLink;
    interview.status = "scheduled";

    await interview.save();

    // Send rescheduling email
    try {
      const subject = `Interview Rescheduled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">Interview Rescheduled</h2>
          <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
          <p>Your interview has been rescheduled with the following updated details:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Previous Date:</strong> ${new Date(oldDate).toLocaleString()}</p>
            <p><strong>New Date & Time:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
            <p><strong>Position:</strong> ${interview.candidate.position}</p>
            ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
          </div>
          <p>Please update your calendar accordingly.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `;
      
      await sendEmail(interview.candidate.email, subject, '', html);
    } catch (emailError) {
      console.error('Failed to send rescheduling email:', emailError);
    }

    res.json({ message: "Interview rescheduled successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all interviews (existing function remains the same)
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
      .sort({ interviewDate: -1 })
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

// Get single interview by ID (existing function remains the same)
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate', 'firstName lastName email position')
      .populate('scheduledBy', 'name email');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};