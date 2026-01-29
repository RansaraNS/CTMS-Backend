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
      const candidateSubject = `Invitation: ${interviewType} - ${candidate.position}`;
      const candidateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #050C9C 0%, #3572EF 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      Interview Invitation
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #A7E6FF; font-size: 16px; font-weight: 500;">
                      ${interviewType} Interview
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <!-- Greeting -->
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${candidate.firstName} ${candidate.lastName}</strong>,
                    </p>

                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      We are pleased to invite you for an interview for the <strong>${candidate.position}</strong> position at Gamage Recruiters (PVT) Ltd. Your application has impressed us, and we look forward to discussing your qualifications in detail.
                    </p>

                    <!-- Interview Details Card -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #A7E6FF 0%, #E8F5FF 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #3ABEF9;">
                      <tr>
                        <td style="padding: 25px;">
                          <h3 style="margin: 0 0 20px 0; color: #050C9C; font-size: 18px; font-weight: 700; border-bottom: 2px solid #3572EF; padding-bottom: 10px;">
                            📅 Interview Details
                          </h3>
                          
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; width: 140px;">
                                Position:
                              </td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                ${candidate.position}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                Date & Time:
                              </td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                ${interviewDateFormatted}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                Interview Type:
                              </td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                <span style="background-color: #3572EF; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                  ${interviewType}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; vertical-align: top;">
                                Interviewers:
                              </td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                ${interviewers.join(", ")}
                              </td>
                            </tr>
                            ${meetingLink ? `
                            <tr>
                              <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; vertical-align: top;">
                                Meeting Link:
                              </td>
                              <td style="padding: 8px 0;">
                                <a href="${meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 5px;">
                                  🔗 Join Interview
                                </a>
                              </td>
                            </tr>
                            ` : ""}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Instructions Section -->
                    <div style="background-color: #FFF9E6; border-left: 4px solid #FFC107; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                      <h3 style="margin: 0 0 15px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                        ⚠️ Important Instructions
                      </h3>
                      <p style="margin: 0 0 12px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                        Please ensure you follow these guidelines for a smooth interview experience:
                      </p>
                    </div>

                    <!-- Checklist Items -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-weight: bold; font-size: 16px;">⏰</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">Join 5 minutes early</p>
                                <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">This allows time for technical setup and ensures a prompt start.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-weight: bold; font-size: 16px;">📶</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">Stable internet connection</p>
                                <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">Test your connection beforehand to avoid disruptions.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-weight: bold; font-size: 16px;">🤫</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">Quiet environment</p>
                                <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">Choose a distraction-free location for the interview.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E0E0E0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-weight: bold; font-size: 16px;">📹</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">Keep your camera on</p>
                                <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">Video engagement helps build rapport with the interviewers.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: #ffffff; font-weight: bold; font-size: 16px;">👔</span>
                                </div>
                              </td>
                              <td style="padding-left: 15px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">Dress professionally</p>
                                <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">Business attire creates a positive first impression.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Support Note -->
                    <div style="background-color: #F0F9FF; border: 1px solid #3ABEF9; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                      <p style="margin: 0; color: #050C9C; font-size: 14px; line-height: 1.6;">
                        <strong>📧 Need Help?</strong><br>
                        If you have any questions or need to reschedule, please contact us as soon as possible.
                        Contact Email: <a href="mailto:hr.gamagecareer@gmail.com">hr.gamagecareer@gmail.com</a>
                      </p>
                    </div>

                    <!-- Closing -->
                    <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      We look forward to meeting you and learning more about your qualifications.
                    </p>

                    <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                      Best of luck with your preparation!
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                    <p style="margin: 0 0 10px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                      Best Regards,
                    </p>
                    <p style="margin: 0 0 5px 0; color: #3572EF; font-size: 15px; font-weight: 600;">
                      IT Support Team
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 14px; font-weight: 600;">
                      Gamage Recruiters (PVT) Ltd.
                    </p>
                    
                    <!-- Divider -->
                    <div style="margin: 20px auto; width: 60px; height: 3px; background: linear-gradient(90deg, #3572EF 0%, #3ABEF9 100%); border-radius: 2px;"></div>
                    
                    <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                      This is an automated email. Please do not reply to this message.<br>
                      © ${new Date().getFullYear()} Gamage Recruiters (PVT) Ltd. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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

        const interviewerSubject = `Interview Scheduled - ${interviewType} with ${candidate.firstName} ${candidate.lastName} | ${candidate.position}`;

        const interviewerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 650px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #050C9C 0%, #3572EF 100%); padding: 40px 30px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                              Interview Assignment
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #A7E6FF; font-size: 16px; font-weight: 500;">
                              You've been scheduled as an interviewer
                            </p>
                          </td>
                          <td align="right" style="vertical-align: middle;">
                            <div style="background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; display: inline-block;">
                              <span style="color: #ffffff; font-size: 13px; font-weight: 600;">
                                ${interviewType}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Dear Interviewer,
                      </p>

                      <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        You have been assigned to conduct an interview for a candidate applying for the <strong>${candidate.position}</strong> position. Please review the candidate details below and prepare accordingly.
                      </p>

                      <!-- Candidate Profile Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #A7E6FF 0%, #E8F5FF 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #3ABEF9;">
                        <tr>
                          <td style="padding: 25px;">
                            <h3 style="margin: 0 0 20px 0; color: #050C9C; font-size: 18px; font-weight: 700; border-bottom: 2px solid #3572EF; padding-bottom: 10px;">
                              👤 Candidate Profile
                            </h3>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; width: 160px;">
                                  Candidate Name:
                                </td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
                                  ${candidate.firstName} ${candidate.lastName}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                  Applied Position:
                                </td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                  ${candidate.position}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                  Email Address:
                                </td>
                                <td style="padding: 8px 0;">
                                  <a href="mailto:${candidate.email}" style="color: #3572EF; text-decoration: none; font-size: 14px;">
                                    ${candidate.email}
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                  Phone Number:
                                </td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                                  ${candidate.phone || '<span style="color: #999999; font-style: italic;">Not provided</span>'}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Interview Schedule Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9E6; border-radius: 10px; margin-bottom: 25px; border: 2px solid #FFC107;">
                        <tr>
                          <td style="padding: 25px;">
                            <h3 style="margin: 0 0 20px 0; color: #050C9C; font-size: 18px; font-weight: 700; border-bottom: 2px solid #FFC107; padding-bottom: 10px;">
                              📅 Interview Schedule
                            </h3>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; width: 160px;">
                                  Date & Time:
                                </td>
                                <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
                                  ${interviewDateFormatted}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                  Interview Type:
                                </td>
                                <td style="padding: 8px 0;">
                                  <span style="background-color: #3572EF; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                    ${interviewType}
                                  </span>
                                </td>
                              </tr>
                              ${meetingLink ? `
                              <tr>
                                <td style="padding: 15px 0 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; vertical-align: top;">
                                  Meeting Link:
                                </td>
                                <td style="padding: 15px 0 8px 0;">
                                  <a href="${meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                    🔗 Join Interview Meeting
                                  </a>
                                </td>
                              </tr>
                              ` : ""}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Candidate Qualifications -->
                      ${candidate.skills && candidate.skills.length > 0 || candidate.experience || candidate.education ? `
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F0F9FF; border-radius: 10px; margin-bottom: 25px; border: 1px solid #3ABEF9;">
                        <tr>
                          <td style="padding: 25px;">
                            <h3 style="margin: 0 0 20px 0; color: #050C9C; font-size: 18px; font-weight: 700; border-bottom: 2px solid #3572EF; padding-bottom: 10px;">
                              🎓 Candidate Qualifications
                            </h3>
                            
                            ${candidate.skills && candidate.skills.length > 0 ? `
                            <div style="margin-bottom: 20px;">
                              <p style="margin: 0 0 10px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                💡 Key Skills:
                              </p>
                              <div style="margin-top: 8px;">
                                ${candidate.skills.map(skill => `
                                  <span style="display: inline-block; background-color: #3572EF; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px 4px 4px 0;">
                                    ${skill}
                                  </span>
                                `).join('')}
                              </div>
                            </div>
                            ` : ''}
                            
                            ${candidate.experience ? `
                            <div style="margin-bottom: 20px;">
                              <p style="margin: 0 0 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                💼 Experience:
                              </p>
                              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6; padding-left: 20px; border-left: 3px solid #3ABEF9;">
                                ${candidate.experience}
                              </p>
                            </div>
                            ` : ''}
                            
                            ${candidate.education ? `
                            <div>
                              <p style="margin: 0 0 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                                🎓 Education:
                              </p>
                              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6; padding-left: 20px; border-left: 3px solid #3ABEF9;">
                                ${candidate.education}
                              </p>
                            </div>
                            ` : ''}
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- CV Attachment Note -->
                      <div style="background-color: ${cvAttachments.length > 0 ? '#E8F5E9' : '#FFF3E0'}; border-left: 4px solid ${cvAttachments.length > 0 ? '#4CAF50' : '#FF9800'}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <span style="font-size: 24px;">${cvAttachments.length > 0 ? '📎' : '⚠️'}</span>
                            </td>
                            <td style="padding-left: 10px;">
                              <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600;">
                                ${cvAttachments.length > 0 ? 'CV Attached' : 'No CV Available'}
                              </p>
                              <p style="margin: 5px 0 0 0; color: #555555; font-size: 13px; line-height: 1.5;">
                                ${cvAttachments.length > 0 
                                  ? "The candidate's CV has been attached to this email for your review. Please review it before the interview." 
                                  : "No CV is available for this candidate at this time. You may want to request additional information."}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Pre-Interview Checklist -->
                      <div style="background: linear-gradient(135deg, rgba(53, 114, 239, 0.1) 0%, rgba(58, 190, 249, 0.1) 100%); border: 1px solid #3ABEF9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h4 style="margin: 0 0 15px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                          ✅ Pre-Interview Checklist
                        </h4>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #3572EF; font-weight: bold; margin-right: 8px;">□</span>
                              <span style="color: #333333; font-size: 14px;">Review candidate's CV and qualifications</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #3572EF; font-weight: bold; margin-right: 8px;">□</span>
                              <span style="color: #333333; font-size: 14px;">Prepare role-specific interview questions</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #3572EF; font-weight: bold; margin-right: 8px;">□</span>
                              <span style="color: #333333; font-size: 14px;">Test meeting link and technical setup (if virtual)</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #3572EF; font-weight: bold; margin-right: 8px;">□</span>
                              <span style="color: #333333; font-size: 14px;">Familiarize yourself with the job requirements</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #3572EF; font-weight: bold; margin-right: 8px;">□</span>
                              <span style="color: #333333; font-size: 14px;">Join the interview on time</span>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Important Reminders -->
                      <div style="background-color: #FFF9E6; border: 1px solid #FFC107; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 30px; vertical-align: top;">
                              <span style="font-size: 20px;">💡</span>
                            </td>
                            <td style="padding-left: 10px;">
                              <p style="margin: 0 0 8px 0; color: #050C9C; font-size: 14px; font-weight: 700;">
                                Important Reminders:
                              </p>
                              <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 13px; line-height: 1.8;">
                                <li>Conduct the interview in a professional and unbiased manner</li>
                                <li>Submit your feedback through the system within 24 hours</li>
                                <li>Maintain confidentiality of candidate information</li>
                                <li>Contact IT Support Team if you need to reschedule</li>
                                <li>Contact Email: <a href="mailto:hr.gamagecareer@gmail.com">hr.gamagecareer@gmail.com</a></li>
                              </ul>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Closing -->
                      <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        If you have any questions or need additional information about the candidate or interview process, please don't hesitate to reach out to the IT Support Team.
                      </p>

                      <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Thank you for your participation in our recruitment process.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                      <p style="margin: 0 0 10px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                        Best Regards,
                      </p>
                      <p style="margin: 0 0 5px 0; color: #3572EF; font-size: 15px; font-weight: 600;">
                        IT Support Team
                      </p>
                      <p style="margin: 0; color: #666666; font-size: 14px; font-weight: 600;">
                        Gamage Recruiters (PVT) Ltd.
                      </p>
                      
                      <!-- Divider -->
                      <div style="margin: 20px auto; width: 60px; height: 3px; background: linear-gradient(90deg, #3572EF 0%, #3ABEF9 100%); border-radius: 2px;"></div>
                      
                      <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                        This is an automated notification from the GR | CTMS system.<br>
                        © ${new Date().getFullYear()} Gamage Recruiters (PVT) Ltd. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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

    const subject = `Interview Cancellation - ${interview.candidate.position} Position`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;">
                  <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                    <span style="font-size: 30px;">⏸️</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Interview Cancelled
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500;">
                    Your interview has been temporarily cancelled
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <!-- Greeting -->
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Dear <strong>${interview.candidate.firstName} ${interview.candidate.lastName}</strong>,
                  </p>

                  <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    We are writing to inform you that your scheduled interview for the <strong>${interview.candidate.position}</strong> position has been cancelled. We understand this may cause inconvenience, and we sincerely apologize.
                  </p>

                  <!-- Cancellation Alert -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #F59E0B;">
                    <tr>
                      <td style="padding: 25px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <span style="font-size: 40px;">⚠️</span>
                        </div>
                        <h3 style="margin: 0 0 20px 0; color: #92400E; font-size: 18px; font-weight: 700; text-align: center; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">
                          Cancelled Interview Details
                        </h3>
                        
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0; color: #92400E; font-weight: 600; font-size: 14px; width: 150px;">
                              Position:
                            </td>
                            <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: 600;">
                              ${interview.candidate.position}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #92400E; font-weight: 600; font-size: 14px;">
                              Original Date:
                            </td>
                            <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                              ${new Date(interview.interviewDate).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </td>
                          </tr>
                          ${interview.interviewType ? `
                          <tr>
                            <td style="padding: 10px 0; color: #92400E; font-weight: 600; font-size: 14px;">
                              Interview Type:
                            </td>
                            <td style="padding: 10px 0;">
                              <span style="background-color: #F59E0B; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                ${interview.interviewType}
                              </span>
                            </td>
                          </tr>
                          ` : ''}
                          ${interview.interviewers && interview.interviewers.length > 0 ? `
                          <tr>
                            <td style="padding: 10px 0; color: #92400E; font-weight: 600; font-size: 14px; vertical-align: top;">
                              Interviewers:
                            </td>
                            <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                              ${interview.interviewers.join(", ")}
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 10px 0; color: #92400E; font-weight: 600; font-size: 14px;">
                              Current Status:
                            </td>
                            <td style="padding: 10px 0;">
                              <span style="background-color: #F59E0B; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700;">
                                ⏸️ CANCELLED
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${interview.feedback?.overallRating ? `
                  <!-- Overall Rating Card -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #FFA726;">
                    <tr>
                      <td style="padding: 20px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 50px; vertical-align: middle;">
                              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="color: #ffffff; font-size: 24px; font-weight: 700;">⭐</span>
                              </div>
                            </td>
                            <td style="padding-left: 15px;">
                              <p style="margin: 0 0 5px 0; color: #E65100; font-weight: 600; font-size: 13px; text-transform: uppercase;">
                                Your Overall Rating
                              </p>
                              <p style="margin: 0; color: #333333; font-size: 24px; font-weight: 700;">
                                ${interview.feedback.overallRating} / 5.0
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Important Notice -->
                  <div style="background-color: #E0F2FE; border-left: 4px solid #0EA5E9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 24px;">ℹ️</span>
                        </td>
                        <td style="padding-left: 15px;">
                          <p style="margin: 0 0 10px 0; color: #075985; font-size: 16px; font-weight: 700;">
                            Your Application Remains Active
                          </p>
                          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                            Please note that your application is still being considered. This cancellation is temporary, and we may reach out to reschedule your interview at a later date.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- What Happens Next -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #4CAF50;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #1B5E20; font-size: 16px; font-weight: 700;">
                          🔄 What Happens Next?
                        </h3>
                        <div style="color: #333333; font-size: 14px; line-height: 1.8;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                  <tr>
                                    <td style="width: 30px; vertical-align: top;">
                                      <div style="width: 24px; height: 24px; background-color: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #ffffff; font-size: 12px; font-weight: 700;">1</span>
                                      </div>
                                    </td>
                                    <td style="padding-left: 12px;">
                                      <p style="margin: 0; color: #333333; font-size: 14px;">
                                        <strong style="color: #2E7D32;">We will review our schedule</strong> and determine the best time for rescheduling
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                  <tr>
                                    <td style="width: 30px; vertical-align: top;">
                                      <div style="width: 24px; height: 24px; background-color: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #ffffff; font-size: 12px; font-weight: 700;">2</span>
                                      </div>
                                    </td>
                                    <td style="padding-left: 12px;">
                                      <p style="margin: 0; color: #333333; font-size: 14px;">
                                        <strong style="color: #2E7D32;">You will be notified</strong> via email if we decide to reschedule your interview
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                  <tr>
                                    <td style="width: 30px; vertical-align: top;">
                                      <div style="width: 24px; height: 24px; background-color: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #ffffff; font-size: 12px; font-weight: 700;">3</span>
                                      </div>
                                    </td>
                                    <td style="padding-left: 12px;">
                                      <p style="margin: 0; color: #333333; font-size: 14px;">
                                        <strong style="color: #2E7D32;">Your candidacy remains under consideration</strong> for this position
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Action Required -->
                  <div style="background-color: #FFF9E6; border-left: 4px solid #FFC107; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 24px;">📋</span>
                        </td>
                        <td style="padding-left: 15px;">
                          <p style="margin: 0 0 10px 0; color: #92400E; font-size: 16px; font-weight: 700;">
                            No Action Required
                          </p>
                          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                            You don't need to do anything at this time. We will reach out to you directly if we decide to reschedule. However, if you have any questions or concerns, please feel free to contact our HR team.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Contact Support -->
                  <div style="background: linear-gradient(135deg, rgba(53, 114, 239, 0.1) 0%, rgba(58, 190, 249, 0.1) 100%); border: 1px solid #3ABEF9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="font-size: 24px;">💬</span>
                        </td>
                        <td style="padding-left: 15px;">
                          <p style="margin: 0 0 8px 0; color: #050C9C; font-size: 15px; font-weight: 700;">
                            Questions or Concerns?
                          </p>
                          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                            If you have any questions about this cancellation, your application status, or would like to discuss alternative arrangements, please don't hesitate to contact our HR department.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Closing Message -->
                  <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    We sincerely apologize for any inconvenience this cancellation may cause. We value your interest in joining our team and appreciate your patience and understanding during this time.
                  </p>

                  <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    Thank you for your continued interest in Gamage Recruiters.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                  <p style="margin: 0 0 10px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                    Best Regards,
                  </p>
                  <p style="margin: 0 0 5px 0; color: #3572EF; font-size: 15px; font-weight: 600;">
                    HR Team
                  </p>
                  <p style="margin: 0; color: #666666; font-size: 14px; font-weight: 600;">
                    Gamage Recruiters (PVT) Ltd.
                  </p>
                  
                  <!-- Divider -->
                  <div style="margin: 20px auto; width: 60px; height: 3px; background: linear-gradient(90deg, #3572EF 0%, #3ABEF9 100%); border-radius: 2px;"></div>
                  
                  <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                    This is an automated notification regarding your interview status.<br>
                    © ${new Date().getFullYear()} Gamage Recruiters (PVT) Ltd. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

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

    // Enhanced HTML Email Template
    const subject = `Interview Rescheduled - ${interview.interviewType || 'Interview'} for ${interview.candidate.position}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #FFA500 0%, #FF6B35 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Interview Rescheduled
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500;">
                    Your interview time has been updated
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <!-- Greeting -->
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Dear <strong>${interview.candidate.firstName} ${interview.candidate.lastName}</strong>,
                  </p>

                  <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    We are writing to inform you that your interview for the <strong>${interview.candidate.position}</strong> position has been rescheduled. Please note the updated date and time below.
                  </p>

                  <!-- Schedule Change Alert -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #FFA500;">
                    <tr>
                      <td style="padding: 25px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <span style="font-size: 40px;">📅</span>
                        </div>
                        <h3 style="margin: 0 0 20px 0; color: #E65100; font-size: 18px; font-weight: 700; text-align: center; border-bottom: 2px solid #FFA500; padding-bottom: 10px;">
                          Schedule Update
                        </h3>
                        
                        <!-- Previous Date -->
                        <div style="background-color: #FFEBEE; border-left: 4px solid #F44336; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <span style="font-size: 20px;">❌</span>
                              </td>
                              <td style="padding-left: 10px;">
                                <p style="margin: 0 0 5px 0; color: #C62828; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Previous Date & Time
                                </p>
                                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 700;">
                                  ${new Date(oldDate).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- Arrow Indicator -->
                        <div style="text-align: center; margin: 15px 0;">
                          <span style="font-size: 30px; color: #FFA500;">⬇️</span>
                        </div>

                        <!-- New Date -->
                        <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 8px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <span style="font-size: 20px;">✅</span>
                              </td>
                              <td style="padding-left: 10px;">
                                <p style="margin: 0 0 5px 0; color: #2E7D32; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                  New Date & Time
                                </p>
                                <p style="margin: 0; color: #333333; font-size: 16px; font-weight: 700;">
                                  ${new Date(interview.interviewDate).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Interview Details Card -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #A7E6FF 0%, #E8F5FF 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #3ABEF9;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="margin: 0 0 20px 0; color: #050C9C; font-size: 18px; font-weight: 700; border-bottom: 2px solid #3572EF; padding-bottom: 10px;">
                          📋 Interview Details
                        </h3>
                        
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; width: 140px;">
                              Position:
                            </td>
                            <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600;">
                              ${interview.candidate.position}
                            </td>
                          </tr>
                          ${interview.interviewType ? `
                          <tr>
                            <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px;">
                              Interview Type:
                            </td>
                            <td style="padding: 8px 0;">
                              <span style="background-color: #3572EF; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                ${interview.interviewType}
                              </span>
                            </td>
                          </tr>
                          ` : ''}
                          ${interview.interviewers && interview.interviewers.length > 0 ? `
                          <tr>
                            <td style="padding: 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; vertical-align: top;">
                              Interviewers:
                            </td>
                            <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                              ${interview.interviewers.join(", ")}
                            </td>
                          </tr>
                          ` : ''}
                          ${interview.meetingLink ? `
                          <tr>
                            <td style="padding: 15px 0 8px 0; color: #050C9C; font-weight: 600; font-size: 14px; vertical-align: top;">
                              Meeting Link:
                            </td>
                            <td style="padding: 15px 0 8px 0;">
                              <a href="${interview.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #3572EF 0%, #3ABEF9 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                🔗 Join Interview Meeting
                              </a>
                            </td>
                          </tr>
                          ` : ""}
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${interview.feedback?.overallRating ? `
                  <!-- Overall Rating Card -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #FFA726;">
                    <tr>
                      <td style="padding: 20px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 50px; vertical-align: middle;">
                              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="color: #ffffff; font-size: 24px; font-weight: 700;">⭐</span>
                              </div>
                            </td>
                            <td style="padding-left: 15px;">
                              <p style="margin: 0 0 5px 0; color: #E65100; font-weight: 600; font-size: 13px; text-transform: uppercase;">
                                Overall Rating
                              </p>
                              <p style="margin: 0; color: #333333; font-size: 24px; font-weight: 700;">
                                ${interview.feedback.overallRating} / 5.0
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Reminder Box -->
                  <div style="background: linear-gradient(135deg, rgba(53, 114, 239, 0.1) 0%, rgba(58, 190, 249, 0.1) 100%); border: 1px solid #3ABEF9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                      📌 Important Reminders
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                      <li>Join the meeting <strong>5 minutes early</strong></li>
                      <li>Ensure you have a <strong>stable internet connection</strong></li>
                      <li>Be in a <strong>quiet environment</strong></li>
                      <li>Keep your <strong>camera on</strong> during the interview</li>
                      <li><strong>Dress professionally</strong></li>
                    </ul>
                  </div>

                  <!-- Action Required Notice -->
                  <div style="background-color: #FFF9E6; border-left: 4px solid #FFC107; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="font-size: 20px;">💡</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                            <strong style="color: #E65100;">Please confirm your availability</strong> for the new date and time. If you cannot attend at the rescheduled time, please contact us immediately.
                            Contact Email: <a href="mailto:hr.gamagecareer@gmail.com">hr.gamagecareer@gmail.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Closing -->
                  <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    We apologize for any inconvenience this change may have caused. If you have any questions or concerns about the rescheduled interview, please don't hesitate to contact us.
                  </p>

                  <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                    We look forward to meeting with you at the new scheduled time.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                  <p style="margin: 0 0 10px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                    Best Regards,
                  </p>
                  <p style="margin: 0 0 5px 0; color: #3572EF; font-size: 15px; font-weight: 600;">
                    IT Support Team
                  </p>
                  <p style="margin: 0; color: #666666; font-size: 14px; font-weight: 600;">
                    Gamage Recruiters (PVT) Ltd.
                  </p>
                  
                  <!-- Divider -->
                  <div style="margin: 20px auto; width: 60px; height: 3px; background: linear-gradient(90deg, #3572EF 0%, #3ABEF9 100%); border-radius: 2px;"></div>
                  
                  <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                    This is an automated notification. Please do not reply to this email.<br>
                    © ${new Date().getFullYear()} Gamage Recruiters (PVT) Ltd. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
        `;

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
        const subject = `Interview Cancellation Notice - ${candidateInfo.position} Position`;
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        Interview Cancelled
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500;">
                        Your scheduled interview has been cancelled
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Dear <strong>${candidateInfo.firstName} ${candidateInfo.lastName}</strong>,
                      </p>

                      <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        We regret to inform you that your scheduled interview for the <strong>${candidateInfo.position}</strong> position has been cancelled and removed from our system.
                      </p>

                      <!-- Cancellation Alert -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #DC2626;">
                        <tr>
                          <td style="padding: 25px;">
                            <div style="text-align: center; margin-bottom: 20px;">
                              <span style="font-size: 40px;">🚫</span>
                            </div>
                            <h3 style="margin: 0 0 20px 0; color: #991B1B; font-size: 18px; font-weight: 700; text-align: center; border-bottom: 2px solid #DC2626; padding-bottom: 10px;">
                              Cancelled Interview Details
                            </h3>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 10px 0; color: #991B1B; font-weight: 600; font-size: 14px; width: 150px;">
                                  Position Applied:
                                </td>
                                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: 600;">
                                  ${candidateInfo.position}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; color: #991B1B; font-weight: 600; font-size: 14px;">
                                  Scheduled Date:
                                </td>
                                <td style="padding: 10px 0; color: #333333; font-size: 14px;">
                                  ${new Date(interview.interviewDate).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </td>
                              </tr>
                              ${interview.interviewType ? `
                              <tr>
                                <td style="padding: 10px 0; color: #991B1B; font-weight: 600; font-size: 14px;">
                                  Interview Type:
                                </td>
                                <td style="padding: 10px 0;">
                                  <span style="background-color: #DC2626; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                    ${interview.interviewType}
                                  </span>
                                </td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 10px 0; color: #991B1B; font-weight: 600; font-size: 14px;">
                                  Status:
                                </td>
                                <td style="padding: 10px 0;">
                                  <span style="background-color: #EF4444; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700;">
                                    ❌ CANCELLED
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Important Notice -->
                      <div style="background-color: #FFF9E6; border-left: 4px solid #FFC107; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <span style="font-size: 24px;">⚠️</span>
                            </td>
                            <td style="padding-left: 15px;">
                              <p style="margin: 0 0 10px 0; color: #E65100; font-size: 16px; font-weight: 700;">
                                Important Notice
                              </p>
                              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                This interview has been permanently removed from our scheduling system. If you believe this cancellation was made in error, please contact our IT Support Team immediately for clarification.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- What This Means -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F0F9FF; border-radius: 10px; margin-bottom: 25px; border: 1px solid #3ABEF9;">
                        <tr>
                          <td style="padding: 25px;">
                            <h3 style="margin: 0 0 15px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                              📋 What This Means
                            </h3>
                            <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                              <li>Your interview appointment has been cancelled</li>
                              <li>You are no longer scheduled for this interview slot</li>
                              <li>No further action is required from you at this time</li>
                              <li>This does not necessarily reflect on your candidacy</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 10px; margin-bottom: 25px; border: 2px solid #4CAF50;">
                        <tr>
                          <td style="padding: 25px;">
                            <h3 style="margin: 0 0 15px 0; color: #1B5E20; font-size: 16px; font-weight: 700;">
                              🎯 Possible Next Steps
                            </h3>
                            <div style="color: #333333; font-size: 14px; line-height: 1.8;">
                              <p style="margin: 0 0 12px 0;">
                                <strong style="color: #2E7D32;">If this was an error:</strong><br>
                                Please contact our IT Support team immediately to reschedule your interview.
                              </p>
                              <p style="margin: 0 0 12px 0;">
                                <strong style="color: #2E7D32;">If you wish to continue:</strong><br>
                                We may reach out to you for future opportunities that match your profile.
                              </p>
                              <p style="margin: 0;">
                                <strong style="color: #2E7D32;">Questions or concerns:</strong><br>
                                Feel free to contact our support team for any clarification.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Contact Information -->
                      <div style="background: linear-gradient(135deg, rgba(53, 114, 239, 0.1) 0%, rgba(58, 190, 249, 0.1) 100%); border: 1px solid #3ABEF9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 40px; vertical-align: top;">
                              <span style="font-size: 24px;">📞</span>
                            </td>
                            <td style="padding-left: 15px;">
                              <p style="margin: 0 0 8px 0; color: #050C9C; font-size: 15px; font-weight: 700;">
                                Need Assistance?
                              </p>
                              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                Our IT Support team is here to help. If you have any questions about this cancellation or would like to discuss your application status, please don't hesitate to reach out to us. 
                                Contact Email: <a href="mailto:hr.gamagecareer@gmail.com">hr.gamagecareer@gmail.com</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Closing Message -->
                      <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        We appreciate your interest in joining our team and apologize for any inconvenience this cancellation may have caused.
                      </p>

                      <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Thank you for your understanding.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                      <p style="margin: 0 0 10px 0; color: #050C9C; font-size: 16px; font-weight: 700;">
                        Best Regards,
                      </p>
                      <p style="margin: 0 0 5px 0; color: #3572EF; font-size: 15px; font-weight: 600;">
                        IT Support Team
                      </p>
                      <p style="margin: 0; color: #666666; font-size: 14px; font-weight: 600;">
                        Gamage Recruiters (PVT) Ltd.
                      </p>
                      
                      <!-- Divider -->
                      <div style="margin: 20px auto; width: 60px; height: 3px; background: linear-gradient(90deg, #3572EF 0%, #3ABEF9 100%); border-radius: 2px;"></div>
                      
                      <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                        This is an automated notification regarding your interview status.<br>
                        © ${new Date().getFullYear()} Gamage Recruiters (PVT) Ltd. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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