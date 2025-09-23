import Candidate from "../models/candidate.model.js";

// Add new candidate with duplicate check
export const addCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, source, resume, notes } = req.body;

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ 
        message: "Candidate already exists in system",
        existingCandidate: {
          id: existingCandidate._id,
          name: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
          status: existingCandidate.status,
          lastPosition: existingCandidate.position
        }
      });
    }

    const candidate = await Candidate.create({
      firstName,
      lastName,
      email,
      phone,
      position,
      source,
      resume,
      notes,
      addedBy: req.user._id,
      lastUpdatedBy: req.user._id
    });

    res.status(201).json({
      message: "Candidate added successfully",
      candidate
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quick scan for existing candidate
export const quickScan = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required for scanning" });
    }

    const candidate = await Candidate.findOne({ email });
    
    if (candidate) {
      return res.json({
        exists: true,
        candidate: {
          id: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          status: candidate.status,
          position: candidate.position,
          rejectionReason: candidate.rejectionReason,
          terminationReason: candidate.terminationReason,
          createdAt: candidate.createdAt
        }
      });
    }

    res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all candidates with filtering and pagination
export const getCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Candidate.countDocuments(query);

    res.json({
      candidates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get candidate by ID
export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update candidate status
export const updateCandidateStatus = async (req, res) => {
  try {
    const { status, rejectionReason, terminationReason } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = status;
    candidate.lastUpdatedBy = req.user._id;

    if (status === 'rejected' && rejectionReason) {
      candidate.rejectionReason = rejectionReason;
    }

    if (status === 'terminated' && terminationReason) {
      candidate.terminationReason = terminationReason;
    }

    await candidate.save();

    res.json({ message: "Candidate status updated successfully", candidate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get candidate history
export const getCandidateHistory = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Get all interviews for this candidate
    const Interview = mongoose.model('Interview');
    const interviews = await Interview.find({ candidate: req.params.id })
      .sort({ interviewDate: -1 });

    res.json({
      candidate,
      interviews,
      history: {
        statusChanges: [], // Can be extended with audit trail
        totalInterviews: interviews.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};