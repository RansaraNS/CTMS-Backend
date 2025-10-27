// import Candidate from "../models/candidate.model.js";
// import Interview from "../models/interview.model.js";

// // Get dashboard statistics (HR can see all data)
// export const getDashboardStats = async (req, res) => {
//   try {
//     // Example: fetch counts from DB
//     const candidatesCount = await Candidate.countDocuments();
//     const interviewsCount = await Interview.countDocuments();
    
//     res.json({
//       candidatesCount,
//       interviewsCount,
//     });
//   } catch (error) {
//     console.error("Dashboard stats error:", error);
//     res.status(500).json({ message: "Failed to load dashboard stats" });
//   }
// };

// export const getAnalytics = async (req, res) => {
//   try {
//     const { timeRange } = req.query; // e.g. "weekly", "monthly"
//     let filter = {};

//     if (timeRange === "weekly") {
//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//       filter = { createdAt: { $gte: oneWeekAgo } };
//     } else if (timeRange === "monthly") {
//       const oneMonthAgo = new Date();
//       oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
//       filter = { createdAt: { $gte: oneMonthAgo } };
//     }

//     const candidates = await Candidate.find(filter).countDocuments();
//     const interviews = await Interview.find(filter).countDocuments();

//     res.json({
//       timeRange,
//       candidates,
//       interviews,
//     });
//   } catch (error) {
//     console.error("Analytics error:", error);
//     res.status(500).json({ message: "Failed to load analytics" });
//   }
// };


// // Get candidate reports (HR can see all candidates)
// export const getCandidateReports = async (req, res) => {
//   try {
//     const { startDate, endDate, status } = req.query;
//     const query = {};

//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     if (startDate && endDate) {
//       query.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const candidates = await Candidate.find(query)
//       .populate('addedBy', 'name email')
//       .sort({ createdAt: -1 });

//     res.json({ candidates });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get interview reports (HR can see all interviews)
// export const getInterviewReports = async (req, res) => {
//   try {
//     const { startDate, endDate, interviewType } = req.query;
//     const query = {};

//     if (interviewType && interviewType !== 'all') {
//       query.interviewType = interviewType;
//     }

//     if (startDate && endDate) {
//       query.interviewDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const interviews = await Interview.find(query)
//       .populate('candidate', 'firstName lastName email position')
//       .populate('scheduledBy', 'name email')
//       .sort({ interviewDate: -1 });

//     res.json({ interviews });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get rejected/terminated candidates report (HR can see all)
// export const getRejectedCandidatesReport = async (req, res) => {
//   try {
//     const rejectedCandidates = await Candidate.find({
//       status: { $in: ['rejected', 'terminated'] }
//     })
//     .populate('addedBy', 'name email')
//     .sort({ updatedAt: -1 });

//     res.json({ rejectedCandidates });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

