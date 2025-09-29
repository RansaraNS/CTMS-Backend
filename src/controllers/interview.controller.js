// // import path from "path";
// // import Interview from "../models/interview.model.js";
// // import Candidate from "../models/candidate.model.js";
// // import sendEmail from "../utils/sendEmail.js";

// // // Helper function to send emails with company logo
// // const sendEmailWithLogo = async (to, subject, html) => {
// //   const attachments = [
// //     {
// //       filename: "company-logo.jpg",
// //       path: path.join("src/public/GR.jpg"), // Adjust path to your logo
// //       cid: "companylogo", // Must match src="cid:companylogo"
// //     },
// //   ];

// //   await sendEmail(to, subject, "", html, attachments);
// // };

// // // Schedule new interview
// // export const scheduleInterview = async (req, res) => {
// //   try {
// //     const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

// //     const candidate = await Candidate.findById(candidateId);
// //     if (!candidate) return res.status(404).json({ message: "Candidate not found" });

// //     const interview = await Interview.create({
// //       candidate: candidateId,
// //       scheduledBy: req.user._id,
// //       interviewDate,
// //       interviewType,
// //       interviewers,
// //       meetingLink,
// //     });

// //     candidate.status = "scheduled";
// //     candidate.lastUpdatedBy = req.user._id;
// //     await candidate.save();

// //     // Send interview scheduled email
// //     try {
// //       const interviewDateFormatted = new Date(interviewDate).toLocaleString();
// //       const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
// //       const html = `
// //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //           <div style="text-align: center; margin-bottom: 20px;">
// //             <img src="cid:companylogo" alt="Company Logo" style="max-width:150px;" />
// //           </div>
// //           <h2 style="color: #0d9488;">Interview Scheduled</h2>
// //           <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
// //           <p>Your interview has been scheduled with the following details:</p>
// //           <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
// //             <p><strong>Position:</strong> ${candidate.position}</p>
// //             <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
// //             <p><strong>Interview Type:</strong> ${interviewType}</p>
// //             <p><strong>Interviewers:</strong> ${interviewers.join(", ")}</p>
// //             ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
// //           </div>
// //           <p>Please make sure to be available at the scheduled time.</p>
// //           <p>Best regards,<br>HR Team</p>
// //         </div>
// //       `;
// //       await sendEmailWithLogo(candidate.email, subject, html);
// //     } catch (emailError) {
// //       console.error("Failed to send interview scheduled email:", emailError);
// //     }

// //     res.status(201).json({ message: "Interview scheduled successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // Update interview feedback with email notifications
// // export const updateInterviewFeedback = async (req, res) => {
// //   try {
// //     const { feedback, outcome } = req.body;
// //     const interview = await Interview.findById(req.params.id).populate("candidate");

// //     if (!interview) return res.status(404).json({ message: "Interview not found" });

// //     interview.status = "completed";
// //     if (feedback) interview.feedback = { ...interview.feedback, ...feedback, submittedAt: new Date() };
// //     if (outcome) interview.feedback = { ...(interview.feedback || {}), outcome };

// //     await interview.save();

// //     if (interview.candidate) {
// //       let candidateStatus = "scheduled";
// //       let emailSubject = `Interview Completed - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //       let emailHtml = `
// //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //           <h2 style="color: #0d9488;">Interview Completed</h2>
// //           <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //           <p>Your interview has been completed and is under review.</p>
// //           <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 15px 0;">
// //             <p><strong>Status:</strong> Under Review</p>
// //             <p>We will contact you soon with the final decision.</p>
// //           </div>
// //           <p>Thank you for your patience.</p>
// //           <p>Best regards,<br>HR Team</p>
// //         </div>
// //       `;

// //       if (outcome === "passed") {
// //         candidateStatus = "hired";
// //         emailSubject = `Congratulations! You've Been Hired - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //         emailHtml = `
// //           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //             <h2 style="color: #059669;">Congratulations! You're Hired! 🎉</h2>
// //             <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //             <p>You have successfully passed the interview process!</p>
// //             <div style="background-color: #d1fae5; padding: 20px; border-radius: 5px; margin: 15px 0;">
// //               <h3 style="color: #065f46;">Offer Details:</h3>
// //               <p><strong>Position:</strong> ${interview.candidate.position}</p>
// //               <p><strong>Status:</strong> Hired</p>
// //             </div>
// //             <p>Our HR team will contact you shortly with the formal offer letter and next steps.</p>
// //             <p>Best regards,<br>HR Team</p>
// //           </div>
// //         `;
// //       } else if (outcome === "recommended-next-round") {
// //         candidateStatus = "interviewed";
// //         emailSubject = `Next Round Interview - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //         emailHtml = `
// //           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //             <h2 style="color: #0d9488;">Next Round Interview</h2>
// //             <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //             <p>You have been recommended for the next round of interviews.</p>
// //             <div style="background-color: #e0f2fe; padding: 20px; border-radius: 5px; margin: 15px 0;">
// //               <p><strong>Status:</strong> Recommended for Next Round</p>
// //             </div>
// //             <p>Our team will contact you soon to schedule the next interview.</p>
// //             <p>Best regards,<br>HR Team</p>
// //           </div>
// //         `;
// //       } else if (outcome === "failed") {
// //         candidateStatus = "rejected";
// //         interview.candidate.rejectionReason = "Failed interview";
// //         emailSubject = `Interview Update - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //         emailHtml = `
// //           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //             <h2 style="color: #dc2626;">Interview Update</h2>
// //             <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //             <p>After careful consideration, we regret to inform you that your application was not successful.</p>
// //             <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin: 15px 0;"></div>
// //             <p>We appreciate your interest in our company.</p>
// //             <p>Best regards,<br>HR Team</p>
// //           </div>
// //         `;
// //       }

// //       interview.candidate.status = candidateStatus;
// //       interview.candidate.lastUpdatedBy = req.user._id;
// //       await interview.candidate.save();

// //       try {
// //         await sendEmailWithLogo(interview.candidate.email, emailSubject, emailHtml);
// //       } catch (emailError) {
// //         console.error("Failed to send outcome email:", emailError);
// //       }
// //     }

// //     res.json({ message: "Interview feedback updated successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // Cancel interview
// // export const cancelInterview = async (req, res) => {
// //   try {
// //     const interview = await Interview.findById(req.params.id).populate("candidate");
// //     if (!interview) return res.status(404).json({ message: "Interview not found" });

// //     interview.status = "cancelled";
// //     await interview.save();

// //     const subject = `Interview Cancelled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //     const html = `
// //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //         <h2 style="color: #dc2626;">Interview Cancelled</h2>
// //         <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //         <p>Your scheduled interview has been cancelled.</p>
// //         <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0;">
// //           <p><strong>Original Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
// //           <p><strong>Position:</strong> ${interview.candidate.position}</p>
// //         </div>
// //         <p>Best regards,<br>HR Team</p>
// //       </div>
// //     `;
// //     await sendEmailWithLogo(interview.candidate.email, subject, html);

// //     res.json({ message: "Interview cancelled successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // Reschedule interview
// // export const rescheduleInterview = async (req, res) => {
// //   try {
// //     const { interviewDate, meetingLink } = req.body;
// //     const interview = await Interview.findById(req.params.id).populate("candidate");
// //     if (!interview) return res.status(404).json({ message: "Interview not found" });

// //     const oldDate = interview.interviewDate;
// //     interview.interviewDate = interviewDate || oldDate;
// //     interview.meetingLink = meetingLink || interview.meetingLink;
// //     interview.status = "scheduled";
// //     await interview.save();

// //     const subject = `Interview Rescheduled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
// //     const html = `
// //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //         <h2 style="color: #0d9488;">Interview Rescheduled</h2>
// //         <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
// //         <p>Your interview has been rescheduled:</p>
// //         <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
// //           <p><strong>Previous Date:</strong> ${new Date(oldDate).toLocaleString()}</p>
// //           <p><strong>New Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
// //           <p><strong>Position:</strong> ${interview.candidate.position}</p>
// //           ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ""}
// //         </div>
// //         <p>Best regards,<br>HR Team</p>
// //       </div>
// //     `;
// //     await sendEmailWithLogo(interview.candidate.email, subject, html);

// //     res.json({ message: "Interview rescheduled successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // Get interviews with pagination and filters
// // export const getInterviews = async (req, res) => {
// //   try {
// //     const { page = 1, limit = 10, status, date } = req.query;
// //     const query = {};

// //     if (status && status !== "all") query.status = status;
// //     if (date) {
// //       const startDate = new Date(date);
// //       const endDate = new Date(date);
// //       endDate.setDate(endDate.getDate() + 1);
// //       query.interviewDate = { $gte: startDate, $lt: endDate };
// //     }

// //     const interviews = await Interview.find(query)
// //       .populate("candidate", "firstName lastName email position")
// //       .populate("scheduledBy", "name email")
// //       .sort({ interviewDate: -1 })
// //       .limit(limit)
// //       .skip((page - 1) * limit);

// //     const total = await Interview.countDocuments(query);

// //     res.json({ interviews, totalPages: Math.ceil(total / limit), currentPage: page, total });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // Get single interview by ID
// // export const getInterviewById = async (req, res) => {
// //   try {
// //     const interview = await Interview.findById(req.params.id)
// //       .populate("candidate", "firstName lastName email position")
// //       .populate("scheduledBy", "name email");

// //     if (!interview) return res.status(404).json({ message: "Interview not found" });

// //     res.json({ interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };



// // export const getUpcomingInterviews = async (req, res) => {
// //   try {
// //     const limit = parseInt(req.query.limit) || 5;

// //     const interviews = await Interview.find({
// //       interviewDate: { $gte: new Date() },
// //       status: "scheduled"
// //     })
// //       .populate('candidate', 'firstName lastName email position')
// //       .sort({ interviewDate: 1 })
// //       .limit(limit);

// //     res.status(200).json({ interviews });
// //   } catch (error) {
// //     console.error("Error fetching upcoming interviews:", error);
// //     res.status(500).json({ message: "Failed to fetch upcoming interviews" });
// //   }
// // };


// // // Enhanced delete function with role check
// // export const deleteInterview = async (req, res) => {
// //   try {
// //     // // Check if user has admin role
// //     // if (req.user.role !== 'admin') {
// //     //   return res.status(403).json({ message: "Only administrators can delete interviews" });
// //     // }

// //     const interview = await Interview.findById(req.params.id).populate("candidate");
    
// //     if (!interview) {
// //       return res.status(404).json({ message: "Interview not found" });
// //     }

// //     // Prevent deletion of interviews that are completed and have feedback
// //     if (interview.status === 'completed' && interview.feedback) {
// //       return res.status(400).json({ 
// //         message: "Cannot delete completed interviews with feedback. Cancel instead." 
// //       });
// //     }

// //     // Store candidate info for email before deletion
// //     const candidateInfo = interview.candidate ? {
// //       firstName: interview.candidate.firstName,
// //       lastName: interview.candidate.lastName,
// //       email: interview.candidate.email,
// //       position: interview.candidate.position
// //     } : null;

// //     // Delete the interview
// //     await Interview.findByIdAndDelete(req.params.id);

// //     // Send deletion notification email if candidate exists
// //     if (candidateInfo) {
// //       try {
// //         const subject = `Interview Deleted - ${candidateInfo.firstName} ${candidateInfo.lastName}`;
// //         const html = `
// //           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //             <h2 style="color: #dc2626;">Interview Deleted</h2>
// //             <p>Dear ${candidateInfo.firstName} ${candidateInfo.lastName},</p>
// //             <p>Your scheduled interview has been deleted from our system.</p>
// //             <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0;">
// //               <p><strong>Position:</strong> ${candidateInfo.position}</p>
// //               <p><strong>Scheduled Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
// //             </div>
// //             <p>If you believe this is an error, please contact our HR team.</p>
// //             <p>Best regards,<br>HR Team</p>
// //           </div>
// //         `;
// //         await sendEmailWithLogo(candidateInfo.email, subject, html);
// //       } catch (emailError) {
// //         console.error("Failed to send interview deletion email:", emailError);
// //       }
// //     }

// //     res.json({ message: "Interview deleted successfully" });
// //   } catch (err) {
// //     console.error("Error deleting interview:", err);
// //     res.status(500).json({ message: "Failed to delete interview" });
// //   }
// // };


// // controllers/interview.controller.js
// import path from "path";
// import fs from "fs";
// import Interview from "../models/interview.model.js";
// import Candidate from "../models/candidate.model.js";
// import sendEmail from "../utils/sendEmail.js";

// // ========== Email Helper ==========
// const sendEmailWithLogo = async (to, subject, html) => {
//   const attachments = [
//     {
//       filename: "company-logo.jpg",
//       path: path.join("src/public/GR.jpg"), // adjust to your logo location
//       cid: "companylogo",
//     },
//   ];
//   await sendEmail(to, subject, "", html, attachments);

//    const allAttachments = [...defaultAttachments, ...attachments];
//   await sendEmail(to, subject, "", html, allAttachments);
// };



 


// // ========== Schedule New Interview ==========
// export const scheduleInterview = async (req, res) => {
//   try {
//     const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

//     const candidate = await Candidate.findById(candidateId);
//     if (!candidate) return res.status(404).json({ message: "Candidate not found" });

//     const interview = await Interview.create({
//       candidate: candidateId,
//       scheduledBy: req.user._id,
//       interviewDate,
//       interviewType,
//       interviewers,
//       meetingLink,
//     });

//     candidate.status = "scheduled";
//     candidate.lastUpdatedBy = req.user._id;
//     await candidate.save();

//     // Email with CV attachment
//     try {
//       const interviewDateFormatted = new Date(interviewDate).toLocaleString();
//       const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
      
//       // Prepare additional attachments (CV)
//       const additionalAttachments = [];

//       // Add CV attachment if exists
//       if (candidate.cv) {
//         const cvFilename = candidate.cv.split('/').pop();
//         const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
//         const cvPath = path.join(uploadsDir, cvFilename);
        
//         console.log('Looking for CV at:', cvPath); // Debug log
        
//         if (fs.existsSync(cvPath)) {
//           additionalAttachments.push({
//             filename: `CV_${candidate.firstName}_${candidate.lastName}.pdf`,
//             path: cvPath,
//             contentType: 'application/pdf'
//           });
//           console.log('CV found and attached'); // Debug log
//         } else {
//           console.log('CV file not found at path:', cvPath); // Debug log
//         }
//       }

//       const html = `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <img src="cid:companylogo" alt="Company Logo" style="max-width:150px;" />
//           </div>
//           <h2 style="color: #0d9488;">Interview Scheduled</h2>
//           <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
//           <p>Your interview has been scheduled with the following details:</p>
//           <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
//             <p><strong>Position:</strong> ${candidate.position}</p>
//             <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
//             <p><strong>Interview Type:</strong> ${interviewType}</p>
//             <p><strong>Interviewers:</strong> ${interviewers.join(", ")}</p>
//             ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
//           </div>
//           ${additionalAttachments.length > 0 ? `
//             <p><strong>Note:</strong> Your CV has been attached to this email for interviewer reference.</p>
//           ` : ""}
//           <p>Please be available at the scheduled time.</p>
//           <p>Best regards,<br>HR Team</p>
//         </div>
//       `;

//       // Send email with all attachments
//       await sendEmailWithLogo(candidate.email, subject, html, additionalAttachments);
//       console.log('Interview scheduled email sent successfully');

//     } catch (emailError) {
//       console.error("Failed to send schedule email:", emailError);
//       // Don't throw error, just log it - the interview was still scheduled successfully
//     }

//     res.status(201).json({ 
//       message: "Interview scheduled successfully", 
//       interview,
//       emailSent: true
//     });

//   } catch (err) {
//     console.error("Error scheduling interview:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // ========== Schedule New Interview ==========
// // export const scheduleInterview = async (req, res) => {
// //   try {
// //     const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

// //     const candidate = await Candidate.findById(candidateId);
// //     if (!candidate) return res.status(404).json({ message: "Candidate not found" });

// //     const interview = await Interview.create({
// //       candidate: candidateId,
// //       scheduledBy: req.user._id,
// //       interviewDate,
// //       interviewType,
// //       interviewers,
// //       meetingLink,
// //     });

// //     candidate.status = "scheduled";
// //     candidate.lastUpdatedBy = req.user._id;
// //     await candidate.save();

// //     // Email
// //     try {
// //       const interviewDateFormatted = new Date(interviewDate).toLocaleString();
// //       const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
// //       const html = `
// //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
// //           <div style="text-align: center; margin-bottom: 20px;">
// //             <img src="cid:companylogo" alt="Company Logo" style="max-width:150px;" />
// //           </div>
// //           <h2 style="color: #0d9488;">Interview Scheduled</h2>
// //           <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
// //           <p>Your interview has been scheduled with the following details:</p>
// //           <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
// //             <p><strong>Position:</strong> ${candidate.position}</p>
// //             <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
// //             <p><strong>Interview Type:</strong> ${interviewType}</p>
// //             <p><strong>Interviewers:</strong> ${interviewers.join(", ")}</p>
// //             ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
// //           </div>
// //           <p>Please be available at the scheduled time.</p>
// //           <p>Best regards,<br>HR Team</p>
// //         </div>
// //       `;
// //       await sendEmailWithLogo(candidate.email, subject, html);
// //     } catch (e) {
// //       console.error("Failed to send schedule email:", e);
// //     }

// //     res.status(201).json({ message: "Interview scheduled successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // ========== Schedule New Interview ==========
// // export const scheduleInterview = async (req, res) => {
// //   try {
// //     const { candidateId, interviewDate, interviewType, interviewers, meetingLink } = req.body;

// //     const candidate = await Candidate.findById(candidateId);
// //     if (!candidate) return res.status(404).json({ message: "Candidate not found" });

// //     const interview = await Interview.create({
// //       candidate: candidateId,
// //       scheduledBy: req.user._id,
// //       interviewDate,
// //       interviewType,
// //       interviewers,
// //       meetingLink,
// //     });

// //     candidate.status = "scheduled";
// //     candidate.lastUpdatedBy = req.user._id;
// //     await candidate.save();

// //     // Email with CV attachment
// //     try {
// //       const interviewDateFormatted = new Date(interviewDate).toLocaleString();
// //       const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
      
// //       // Prepare email attachments
// //       const attachments = [
// //         {
// //           filename: "company-logo.jpg",
// //           path: path.join("src/public/GR.jpg"),
// //           cid: "companylogo",
// //         }
// //       ];

// //       // Add CV attachment if exists
// //       if (candidate.cv) {
// //         const cvFilename = candidate.cv.split('/').pop();
// //         const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
// //         const cvPath = path.join(uploadsDir, cvFilename);
        
// //         if (fs.existsSync(cvPath)) {
// //           attachments.push({
// //             filename: `CV_${candidate.firstName}_${candidate.lastName}.pdf`,
// //             path: cvPath,
// //             contentType: 'application/pdf'
// //           });
// //         }
// //       }

// //       const html = `
// //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
// //           <div style="text-align: center; margin-bottom: 20px;">
// //             <img src="cid:companylogo" alt="Company Logo" style="max-width:150px;" />
// //           </div>
// //           <h2 style="color: #0d9488;">Interview Scheduled</h2>
// //           <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
// //           <p>Your interview has been scheduled with the following details:</p>
// //           <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
// //             <p><strong>Position:</strong> ${candidate.position}</p>
// //             <p><strong>Date & Time:</strong> ${interviewDateFormatted}</p>
// //             <p><strong>Interview Type:</strong> ${interviewType}</p>
// //             <p><strong>Interviewers:</strong> ${interviewers.join(", ")}</p>
// //             ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
// //           </div>
// //           ${candidate.cv ? `<p><strong>Note:</strong> Your CV has been attached to this email for interviewer reference.</p>` : ""}
// //           <p>Please be available at the scheduled time.</p>
// //           <p>Best regards,<br>HR Team</p>
// //         </div>
// //       `;

// //       // Send email with attachments
// //       await sendEmail(candidate.email, subject, "", html, attachments);

// //     } catch (e) {
// //       console.error("Failed to send schedule email:", e);
// //     }

// //     res.status(201).json({ message: "Interview scheduled successfully", interview });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // ========== Update Interview Feedback ==========
// export const updateInterviewFeedback = async (req, res) => {
//   try {
//     const { feedback, outcome } = req.body;
//     const interview = await Interview.findById(req.params.id).populate("candidate");
//     if (!interview) return res.status(404).json({ message: "Interview not found" });

//     interview.status = "completed";
//     if (feedback) interview.feedback = { ...interview.feedback, ...feedback, submittedAt: new Date() };
//     if (outcome) interview.feedback = { ...(interview.feedback || {}), outcome };

//     await interview.save();

//     if (interview.candidate) {
//       let candidateStatus = "scheduled";
//       let emailSubject = `Interview Completed - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//       let emailHtml = `
//         <h2 style="color:#0d9488;">Interview Completed</h2>
//         <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//         <p>Your interview has been completed and is under review.</p>
//         <div style="background:#f3f4f6;padding:20px;border-radius:5px;margin:15px 0;">
//           <p><strong>Status:</strong> Under Review</p>
//         </div>
//         <p>We will contact you soon with the final decision.</p>
//       `;

//       if (outcome === "passed") {
//         candidateStatus = "hired";
//         emailSubject = `Congratulations! You're Hired - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//         emailHtml = `
//           <h2 style="color:#059669;">Congratulations! You're Hired 🎉</h2>
//           <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//           <p>You passed the interview!</p>
//           <div style="background:#d1fae5;padding:20px;border-radius:5px;margin:15px 0;">
//             <p><strong>Position:</strong> ${interview.candidate.position}</p>
//             <p><strong>Status:</strong> Hired</p>
//           </div>
//           <p>HR will contact you with next steps.</p>
//         `;
//       } else if (outcome === "recommended-next-round") {
//         candidateStatus = "interviewed";
//         emailSubject = `Next Round Interview - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//         emailHtml = `
//           <h2 style="color:#0d9488;">Next Round Interview</h2>
//           <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//           <p>You have been recommended for the next round.</p>
//           <div style="background:#e0f2fe;padding:20px;border-radius:5px;margin:15px 0;">
//             <p><strong>Status:</strong> Next Round</p>
//           </div>
//         `;
//       } else if (outcome === "failed") {
//         candidateStatus = "rejected";
//         interview.candidate.rejectionReason = "Failed interview";
//         emailSubject = `Interview Update - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//         emailHtml = `
//           <h2 style="color:#dc2626;">Interview Update</h2>
//           <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//           <p>We regret to inform you that your application was not successful.</p>
//           <div style="background:#fee2e2;padding:20px;border-radius:5px;margin:15px 0;">
//             <p><strong>Status:</strong> Rejected</p>
//           </div>
//         `;
//       }

//       // Inject Overall Grade if exists
//       if (interview.feedback?.overallRating) {
//         emailHtml += `
//           <div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
//             <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p>
//           </div>
//         `;
//       }

//       emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${emailHtml}<p>Best regards,<br>HR Team</p></div>`;

//       interview.candidate.status = candidateStatus;
//       interview.candidate.lastUpdatedBy = req.user._id;
//       await interview.candidate.save();

//       try {
//         await sendEmailWithLogo(interview.candidate.email, emailSubject, emailHtml);
//       } catch (e) {
//         console.error("Failed to send outcome email:", e);
//       }
//     }

//     res.json({ message: "Interview feedback updated successfully", interview });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========== Cancel Interview ==========
// export const cancelInterview = async (req, res) => {
//   try {
//     const interview = await Interview.findById(req.params.id).populate("candidate");
//     if (!interview) return res.status(404).json({ message: "Interview not found" });

//     interview.status = "cancelled";
//     await interview.save();

//     if (interview.candidate) {
//       interview.candidate.status = "cancelled";
//       await interview.candidate.save();
//     }

//     let html = `
//       <h2 style="color:#dc2626;">Interview Cancelled</h2>
//       <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//       <p>Your interview has been cancelled.</p>
//       <div style="background:#fee2e2;padding:15px;border-radius:5px;margin:15px 0;">
//         <p><strong>Original Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
//         <p><strong>Position:</strong> ${interview.candidate.position}</p>
//       </div>
//     `;

//     if (interview.feedback?.overallRating) {
//       html += `<div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
//         <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p></div>`;
//     }

//     html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${html}<p>Best regards,<br>HR Team</p></div>`;

//     const subject = `Interview Cancelled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//     await sendEmailWithLogo(interview.candidate.email, subject, html);

//     res.json({ message: "Interview cancelled successfully", interview });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========== Reschedule Interview ==========
// export const rescheduleInterview = async (req, res) => {
//   try {
//     const { interviewDate, meetingLink } = req.body;
//     const interview = await Interview.findById(req.params.id).populate("candidate");
//     if (!interview) return res.status(404).json({ message: "Interview not found" });

//     const oldDate = interview.interviewDate;
//     interview.interviewDate = interviewDate || oldDate;
//     interview.meetingLink = meetingLink || interview.meetingLink;
//     interview.status = "scheduled";
//     await interview.save();

//     if (interview.candidate) {
//       interview.candidate.status = "scheduled";
//       await interview.candidate.save();
//     }

//     let html = `
//       <h2 style="color:#0d9488;">Interview Rescheduled</h2>
//       <p>Dear ${interview.candidate.firstName} ${interview.candidate.lastName},</p>
//       <p>Your interview has been rescheduled:</p>
//       <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:15px 0;">
//         <p><strong>Previous Date:</strong> ${new Date(oldDate).toLocaleString()}</p>
//         <p><strong>New Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
//         <p><strong>Position:</strong> ${interview.candidate.position}</p>
//         ${interview.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ""}
//       </div>
//     `;

//     if (interview.feedback?.overallRating) {
//       html += `<div style="background:#fef9c3;padding:15px;border-radius:5px;margin:15px 0;">
//         <p><strong>Overall Grade:</strong> ${interview.feedback.overallRating} / 5</p></div>`;
//     }

//     html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${html}<p>Best regards,<br>HR Team</p></div>`;

//     const subject = `Interview Rescheduled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
//     await sendEmailWithLogo(interview.candidate.email, subject, html);

//     res.json({ message: "Interview rescheduled successfully", interview });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========== Get Interviews (Paginated) ==========
// export const getInterviews = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, date } = req.query;
//     const query = {};

//     if (status && status !== "all") query.status = status;
//     if (date) {
//       const startDate = new Date(date);
//       const endDate = new Date(date);
//       endDate.setDate(endDate.getDate() + 1);
//       query.interviewDate = { $gte: startDate, $lt: endDate };
//     }

//     const interviews = await Interview.find(query)
//       .populate("candidate", "firstName lastName email position")
//       .populate("scheduledBy", "name email")
//       .sort({ interviewDate: -1 })
//       .limit(limit)
//       .skip((page - 1) * limit);

//     const total = await Interview.countDocuments(query);
//     res.json({ interviews, totalPages: Math.ceil(total / limit), currentPage: page, total });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========== Get Single Interview ==========
// export const getInterviewById = async (req, res) => {
//   try {
//     const interview = await Interview.findById(req.params.id)
//       .populate("candidate", "firstName lastName email position")
//       .populate("scheduledBy", "name email");

//     if (!interview) return res.status(404).json({ message: "Interview not found" });
//     res.json({ interview });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========== Get Upcoming ==========
// export const getUpcomingInterviews = async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 5;
//     const interviews = await Interview.find({
//       interviewDate: { $gte: new Date() },
//       status: "scheduled",
//     })
//       .populate("candidate", "firstName lastName email position")
//       .sort({ interviewDate: 1 })
//       .limit(limit);

//     res.status(200).json({ interviews });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch upcoming interviews" });
//   }
// };

// // ========== Delete Interview ==========
// export const deleteInterview = async (req, res) => {
//   try {
//     const interview = await Interview.findById(req.params.id).populate("candidate");
//     if (!interview) return res.status(404).json({ message: "Interview not found" });

//     if (interview.status === "completed" && interview.feedback) {
//       return res.status(400).json({ message: "Cannot delete completed interviews with feedback. Cancel instead." });
//     }

//     const candidateInfo = interview.candidate ? {
//       firstName: interview.candidate.firstName,
//       lastName: interview.candidate.lastName,
//       email: interview.candidate.email,
//       position: interview.candidate.position,
//     } : null;

//     await Interview.findByIdAndDelete(req.params.id);

//     if (candidateInfo) {
//       try {
//         const subject = `Interview Deleted - ${candidateInfo.firstName} ${candidateInfo.lastName}`;
//         const html = `
//           <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
//             <h2 style="color:#dc2626;">Interview Deleted</h2>
//             <p>Dear ${candidateInfo.firstName} ${candidateInfo.lastName},</p>
//             <p>Your scheduled interview has been deleted from our system.</p>
//             <div style="background:#fee2e2;padding:15px;border-radius:5px;margin:15px 0;">
//               <p><strong>Position:</strong> ${candidateInfo.position}</p>
//               <p><strong>Scheduled Date:</strong> ${new Date(interview.interviewDate).toLocaleString()}</p>
//             </div>
//             <p>If you believe this is an error, please contact HR.</p>
//             <p>Best regards,<br>HR Team</p>
//           </div>
//         `;
//         await sendEmailWithLogo(candidateInfo.email, subject, html);
//       } catch (e) {
//         console.error("Failed to send delete email:", e);
//       }
//     }

//     res.json({ message: "Interview deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete interview" });
//   }
// };



// controllers/interview.controller.js
import path from "path";
import fs from "fs";
import Interview from "../models/interview.model.js";
import Candidate from "../models/candidate.model.js";
import sendEmail from "../utils/sendEmail.js";

// ========== Email Helper ==========
const sendEmailWithLogo = async (to, subject, html, additionalAttachments = []) => {
  const defaultAttachments = [
    {
      filename: "company-logo.jpg",
      path: path.join("src/public/GR.jpg"), // adjust to your logo location
      cid: "companylogo",
    },
  ];

  const allAttachments = [...defaultAttachments, ...additionalAttachments];
  await sendEmail(to, subject, "", html, allAttachments);
};

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

    // Email with CV attachment
    try {
      const interviewDateFormatted = new Date(interviewDate).toLocaleString();
      const subject = `Interview Scheduled - ${candidate.firstName} ${candidate.lastName}`;
      
      // Prepare additional attachments (CV)
      const additionalAttachments = [];

      // Add CV attachment if exists
      if (candidate.cv) {
        const cvFilename = candidate.cv.split('/').pop();
        const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
        const cvPath = path.join(uploadsDir, cvFilename);
        
        console.log('Looking for CV at:', cvPath);
        
        if (fs.existsSync(cvPath)) {
          additionalAttachments.push({
            filename: `CV_${candidate.firstName}_${candidate.lastName}.pdf`,
            path: cvPath,
            contentType: 'application/pdf'
          });
          console.log('CV found and attached');
        } else {
          console.log('CV file not found at path:', cvPath);
        }
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:companylogo" alt="Company Logo" style="max-width:150px;" />
          </div>
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
          ${additionalAttachments.length > 0 ? `
            <p><strong>Note:</strong> Your CV has been attached to this email for interviewer reference.</p>
          ` : ""}
          <p>Please be available at the scheduled time.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `;

      // Send email with all attachments
      await sendEmailWithLogo(candidate.email, subject, html, additionalAttachments);
      console.log('Interview scheduled email sent successfully');

    } catch (emailError) {
      console.error("Failed to send schedule email:", emailError);
    }

    res.status(201).json({ 
      message: "Interview scheduled successfully", 
      interview,
      emailSent: true
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

      emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${emailHtml}<p>Best regards,<br>HR Team</p></div>`;

      interview.candidate.status = candidateStatus;
      interview.candidate.lastUpdatedBy = req.user._id;
      await interview.candidate.save();

      try {
        await sendEmailWithLogo(interview.candidate.email, emailSubject, emailHtml);
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

    html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${html}<p>Best regards,<br>HR Team</p></div>`;

    const subject = `Interview Cancelled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
    await sendEmailWithLogo(interview.candidate.email, subject, html);

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

    html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">${html}<p>Best regards,<br>HR Team</p></div>`;

    const subject = `Interview Rescheduled - ${interview.candidate.firstName} ${interview.candidate.lastName}`;
    await sendEmailWithLogo(interview.candidate.email, subject, html);

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
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
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
        await sendEmailWithLogo(candidateInfo.email, subject, html);
      } catch (e) {
        console.error("Failed to send delete email:", e);
      }
    }

    res.json({ message: "Interview deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete interview" });
  }
};