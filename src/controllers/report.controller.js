import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const newCandidates = await Candidate.countDocuments({ status: "new" });
    const interviewedCandidates = await Candidate.countDocuments({ status: "interviewed" });
    const hiredCandidates = await Candidate.countDocuments({ status: "hired" });
    const rejectedCandidates = await Candidate.countDocuments({ status: "rejected" });

    const upcomingInterviews = await Interview.countDocuments({
      interviewDate: { $gte: new Date() },
      status: "scheduled"
    });

    const todayInterviews = await Interview.countDocuments({
      interviewDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      },
      status: "scheduled"
    });

    res.json({
      totalCandidates,
      newCandidates,
      interviewedCandidates,
      hiredCandidates,
      rejectedCandidates,
      upcomingInterviews,
      todayInterviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get candidate reports
export const getCandidateReports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const candidates = await Candidate.find(query)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get interview reports
export const getInterviewReports = async (req, res) => {
  try {
    const { startDate, endDate, interviewType } = req.query;
    const query = {};

    if (interviewType && interviewType !== 'all') {
      query.interviewType = interviewType;
    }

    if (startDate && endDate) {
      query.interviewDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'firstName lastName email position')
      .populate('scheduledBy', 'name email')
      .sort({ interviewDate: -1 });

    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get rejected/terminated candidates report
export const getRejectedCandidatesReport = async (req, res) => {
  try {
    const rejectedCandidates = await Candidate.find({
      status: { $in: ['rejected', 'terminated'] }
    })
    .populate('addedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json({ rejectedCandidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};