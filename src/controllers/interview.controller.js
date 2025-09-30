import path from "path";
import fs from "fs";
import Interview from "../models/interview.model.js";
import Candidate from "../models/candidate.model.js";
import sendEmail from "../utils/sendEmail.js";

// ========== Schedule New Interview ==========
export const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const interview = await Interview.create({
      candidate: candidateId,
      scheduledBy: req.user._id,
      interviewDate,
      interviewType,
      interviewers,
      meetingLink,
    });

    candidate.status = "scheduled";
    candidate.lastUpdatedBy = req.user._id;
    await candidate.save();

    // Prepare CV attachment if exists
    const cvAttachments = [];
    if (candidate.cv) {
      const cvFilename = candidate.cv.split('/').pop();
      const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
      const cvPath = path.join(uploadsDir, cvFilename);
      
      if (fs.existsSync(cvPath)) {
        cvAttachments.push({
          filename: `CV_${candidate.firstName}_${candidate.lastName}.pdf`,
          path: cvPath,
          contentType: 'application/pdf'
        });
        console.log('CV found and will be attached');
      } else {
        console.log('CV file not found at path:', cvPath);
      }
    }

    const interviewDateFormatted = new Date(interviewDate).toLocaleString();
    
    // Email 1: Send to Candidate (without CV)
    try {
      const candidateSubject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
      const candidateHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #0d9488;">Interview Scheduled</h2>
          <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
          <p>Your interview has been scheduled with the following details:</p>
          <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
            <p><strong>Position:</strong> ${candidate.position}</p>
            <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
            <p><strong>Interview Type:</strong> ${interviewType}</p>
            <p><strong>Interviewers:</strong> ${interviewers.join(", ")}</p>
            ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
          </div>
          <p>Please make sure to:</p>
          <ul>
            <li>Join the meeting 5 minutes early</li>
            <li>Have a stable internet connection</li>
            <li>Be in a quiet environment</li>
            <li>Keep your camera on during the interview</li>
          </ul>
          <p>Best regards,<br>HR Team</p>
        </div>
      `;

      await sendEmail(candidate.email, candidateSubject, "", candidateHtml);
      console.log('Interview scheduled email sent to candidate successfully');
    } catch (candidateEmailError) {
      console.error("Failed to send email to candidate:", candidateEmailError);
    }

    // Email 2: Send to Interviewers (with CV attachment)
    try {
      for (const interviewerEmail of interviewers) {
        const trimmedEmail = interviewerEmail.trim();
        if (!trimmedEmail) continue;

        const interviewerSubject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName} for ${candidate.position}`;
        const interviewerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #0d9488;">Interview Scheduled</h2>
            <p>Dear Interviewer,</p>
            <p>You have been scheduled to interview a candidate with the following details:</p>
            <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
              <p><strong>Candidate Name:</strong> ${candidate.firstName} ${candidate.lastName}</p>
              <p><strong>Position:</strong> ${candidate.position}</p>
              <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
              <p><strong>Interview Type:</strong> ${interviewType}</p>
              <p><strong>Candidate Email:</strong> ${candidate.email}</p>
              <p><strong>Candidate Phone:</strong> ${candidate.phone || 'Not provided'}</p>
              ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
            </div>
            ${cvAttachments.length > 0 ? `
              <p><strong>Note:</strong> The candidate's CV has been attached to this email for your reference.</p>
            ` : `
              <p><strong>Note:</strong> No CV available for this candidate.</p>
            `}
            
            ${candidate.skills && candidate.skills.length > 0 ? `
              <p><strong>Key Skills:</strong> ${candidate.skills.join(', ')}</p>
            ` : ''}
            
            ${candidate.experience ? `
              <p><strong>Experience:</strong> ${candidate.experience}</p>
            ` : ''}
            
            ${candidate.education ? `
              <p><strong>Education:</strong> ${candidate.education}</p>
            ` : ''}
           
            <p>Please review the candidate's profile before the interview.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;

        // Send email with CV attachments to interviewers
        await sendEmail(trimmedEmail, interviewerSubject, "", interviewerHtml, cvAttachments);
        console.log(`Interview scheduled email sent to interviewer: ${trimmedEmail}`);
      }
    } catch (interviewerEmailError) {
      console.error("Failed to send email to interviewers:", interviewerEmailError);
    }

    res.status(201).json({ 
      message: "Interview scheduled successfully", 
      interview,
      emailsSent: {
        candidate: true,
        interviewers: interviewers.length
      }
    });

  } catch (err) {
    console.error("Error scheduling interview:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========== Update Interview Feedback ==========
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { feedback, outcome } = req.body;
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "completed";
    if (feedback) interview.feedback = { ...interview.feedback, ...feedback, submittedAt: new Date() };
    if (outcome) interview.feedback = { ...(interview.feedback || {}), outcome };

    await interview.save();

    if (interview.candidate) {
      let candidateStatus = "scheduled";
      let emailSubject = `Interview Completed - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
      let emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color:#0d9488;">Interview Completed</h2>
          <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
          <p>Your interview has been completed and is under review.</p>
          <div style="background:#f3f4f6;padding:20px;border-radius:5px;margin:15px 0;">
            <p><strong>Status:</strong> Under Review</p>
          </div>
          <p>We will contact you soon with the final decision.</p>
      `;

      if (outcome === "passed") {
        candidateStatus = "hired";
        emailSubject = `Congratulations! You're Hired - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color:#059669;">Congratulations! You're Hired 🎉</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>You passed the interview!</p>
            <div style="background:#d1fae5;padding:20px;border-radius:5px;margin:15px 0;">
              <p><strong>Position:</strong> ${interview.candidate.position}</p>
              <p><strong>Status:</strong> Hired</p>
            </div>
            <p>HR will contact you with next steps.</p>
        `;
      } else if (outcome === "recommended-next-round") {
        candidateStatus = "interviewed";
        emailSubject = `Next Round Interview - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color:#0d9488;">Next Round Interview</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>You have been recommended for the next round.</p>
            <div style="background:#e0f2fe;padding:20px;border-radius:5px;margin:15px 0;">
              <p><strong>Status:</strong> Next Round</p>
            </div>
        `;
      } else if (outcome === "failed") {
        candidateStatus = "rejected";
        interview.candidate.rejectionReason = "Failed interview";
        emailSubject = `Interview Update - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color:#dc2626;">Interview Update</h2>
            <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
            <p>We regret to inform you that your application was not successful.</p>
            <div style="background:#fee2e2;padding:20px;border-radius:5px;margin:15px 0;">
              <p><strong>Status:</strong> Rejected</p>
            </div>
        `;
      }

      // Inject Overall Grade if exists
      if (interview.feedback?.overallRating) {
        emailHtml += `
          <div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
            <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p>
          </div>
        `;
      }

      emailHtml += `<p>Best regards,<br>HR Team</p></div>`;

      interview.candidate.status = candidateStatus;
      interview.candidate.lastUpdatedBy = req.user._id;
      await interview.candidate.save();

      try {
        await sendEmail(interview.candidate.email, emailSubject, "", emailHtml);
      } catch (e) {
        console.error("Failed to send outcome email:", e);
      }
    }

    res.json({ message: "Interview feedback updated successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== Cancel Interview ==========
export const cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "cancelled";
    await interview.save();

    if (interview.candidate) {
      interview.candidate.status = "cancelled";
      await interview.candidate.save();
    }

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#dc2626;">Interview Cancelled</h2>
        <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
        <p>Your interview has been cancelled.</p>
        <div style="background:#fee2e2;padding:15px;border-radius:5px;margin:15px 0;">
          <p><strong>Original Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
          <p><strong>Position:</strong> ${interview.candidate.position}</p>
        </div>
    `;

    if (interview.feedback?.overallRating) {
      html += `<div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
        <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p></div>`;
    }

    html += `<p>Best regards,<br>HR Team</p></div>`;

    const subject = `Interview Cancelled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
    await sendEmail(interview.candidate.email, subject, "", html);

    res.json({ message: "Interview cancelled successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== Reschedule Interview ==========
export const rescheduleInterview = async (req, res) => {
  try {
    const { interviewDate, meetingLink } = req.body;
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const oldDate = interview.interviewDate;
    interview.interviewDate = interviewDate || oldDate;
    interview.meetingLink = meetingLink || interview.meetingLink;
    interview.status = "scheduled";
    await interview.save();

    if (interview.candidate) {
      interview.candidate.status = "scheduled";
      await interview.candidate.save();
    }

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color:#0d9488;">Interview Rescheduled</h2>
        <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
        <p>Your interview has been rescheduled:</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
          <p><strong>Previous Date:</strong> ${new Date(oldDate).toLocaleString()}</p>
          <p><strong>New Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
          <p><strong>Position:</strong> ${interview.candidate.position}</p>
          ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ""}
        </div>
    `;

    if (interview.feedback?.overallRating) {
      html += `<div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
        <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p></div>`;
    }

    html += `<p>Best regards,<br>HR Team</p></div>`;

    const subject = `Interview Rescheduled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
    await sendEmail(interview.candidate.email, subject, "", html);

    res.json({ message: "Interview rescheduled successfully", interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== Get Interviews (Paginated) ==========
export const getInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.interviewDate = { $gte: startDate, $lt: endDate };
    }

    const interviews = await Interview.find(query)
      .populate("candidate", "firstName lastName email position")
      .populate("scheduledBy", "name email")
      .sort({ interviewDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Interview.countDocuments(query);
    res.json({ interviews, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== Get Single Interview ==========
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidate", "firstName lastName email position")
      .populate("scheduledBy", "name email");

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== Get Upcoming ==========
export const getUpcomingInterviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const interviews = await Interview.find({
      interviewDate: { $gte: new Date() },
      status: "scheduled",
    })
      .populate("candidate", "firstName lastName email position")
      .sort({ interviewDate: 1 })
      .limit(limit);

    res.status(200).json({ interviews });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch upcoming interviews" });
  }
};

// ========== Delete Interview ==========
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.status === "completed" && interview.feedback) {
      return res.status(400).json({ message: "Cannot delete completed interviews with feedback. Cancel instead." });
    }

    const candidateInfo = interview.candidate ? {
      firstName: interview.candidate.firstName,
      lastName: interview.candidate.lastName,
      email: interview.candidate.email,
      position: interview.candidate.position,
    } : null;

    await Interview.findByIdAndDelete(req.params.id);

    if (candidateInfo) {
      try {
        const subject = `Interview Deleted - ${candidateInfo.firstName} ${candidateInfo.lastName}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color:#dc2626;">Interview Deleted</h2>
            <p>Dear ${candidateInfo.firstName} ${candidateInfo.lastName},</p>
            <p>Your scheduled interview has been deleted from our system.</p>
            <div style="background:#fee2e2;padding:15px;border-radius:5px;margin:15px 0;">
              <p><strong>Position:</strong> ${candidateInfo.position}</p>
              <p><strong>Scheduled Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
            </div>
            <p>If you believe this is an error, please contact HR.</p>
            <p>Best regards,<br>HR Team</p>
          </div>
        `;
        await sendEmail(candidateInfo.email, subject, "", html);
      } catch (e) {
        console.error("Failed to send delete email:", e);
      }
    }

    res.json({ message: "Interview deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete interview" });
  }
};