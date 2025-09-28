// controllers/candidate.controller.js
import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Add new candidate with enhanced validation
// export const addCandidate = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, position, source, cv, notes, skills } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !position) {
//       return res.status(400).json({
//         message: "First name, last name, email, and position are required"
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     // Check if candidate already exists
//     const existingCandidate = await Candidate.findOne({ email });
//     if (existingCandidate) {
//       return res.status(400).json({
//         message: "Candidate already exists in system",
//         existingCandidate: {
//           id: existingCandidate._id,
//           name: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
//           status: existingCandidate.status,
//           position: existingCandidate.position,
//           createdAt: existingCandidate.createdAt
//         }
//       });
//     }

//     const candidate = await Candidate.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       position,
//       source,
//       resume,
//       notes,
//       experience,
//       skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
//       cv: req.file ? `/uploads/cv/${req.file.filename}` : null, // save file path

//       addedBy: req.user._id,
//       lastUpdatedBy: req.user._id
//     });

//     const populatedCandidate = await Candidate.findById(candidate._id)
//       .populate('addedBy', 'name email');

//     res.status(201).json({
//       message: "Candidate added successfully",
//       candidate: populatedCandidate
//     });
//   } catch (err) {
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(error => error.message);
//       return res.status(400).json({ message: errors.join(', ') });
//     }
//     res.status(500).json({ message: err.message });
//   }
// };


// export const addCandidate = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, position, source, notes, skills, experience } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !position) {
//       return res.status(400).json({
//         message: "First name, last name, email, and position are required"
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     // Check if candidate already exists
//     const existingCandidate = await Candidate.findOne({ email });
//     if (existingCandidate) {
//       return res.status(400).json({
//         message: "Candidate already exists in system",
//         existingCandidate: {
//           id: existingCandidate._id,
//           name: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
//           status: existingCandidate.status,
//           position: existingCandidate.position,
//           createdAt: existingCandidate.createdAt
//         }
//       });
//     }

//     // Create new candidate
//     const candidate = await Candidate.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       position,
//       source,
//       notes,
//       experience,
//       skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
//       cv: req.file ? `/uploads/cv/${req.file.filename}` : null, // store CV path
//       addedBy: req.user._id,
//       lastUpdatedBy: req.user._id
//     });

//     const populatedCandidate = await Candidate.findById(candidate._id)
//       .populate('addedBy', 'name email');

//     res.status(201).json({
//       message: "Candidate added successfully",
//       candidate: populatedCandidate
//     });
//   } catch (err) {
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(error => error.message);
//       return res.status(400).json({ message: errors.join(', ') });
//     }
//     res.status(500).json({ message: err.message });
//   }
// };


// export const addCandidate = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, position, source, notes, skills, experience } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !position) {
//       return res.status(400).json({
//         message: "First name, last name, email, and position are required"
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     // Check if candidate already exists
//     const existingCandidate = await Candidate.findOne({ email });
//     if (existingCandidate) {
//       return res.status(400).json({
//         message: "Candidate already exists in system",
//         existingCandidate: {
//           id: existingCandidate._id,
//           name: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
//           status: existingCandidate.status,
//           position: existingCandidate.position,
//           createdAt: existingCandidate.createdAt
//         }
//       });
//     }

//     // Create new candidate
//     const candidate = await Candidate.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       position,
//       source,
//       notes,
//       experience,
//       skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
//       cv: req.file ? `/uploads/cv/${req.file.filename}` : null,
//       addedBy: req.user._id,
//       lastUpdatedBy: req.user._id
//     });

//     const populatedCandidate = await Candidate.findById(candidate._id)
//       .populate('addedBy', 'name email');

//     res.status(201).json({
//       message: "Candidate added successfully",
//       candidate: populatedCandidate
//     });
//   } catch (err) {
//     // Remove uploaded file if error occurs
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(error => error.message);
//       return res.status(400).json({ message: errors.join(', ') });
//     }
//     res.status(500).json({ message: err.message });
//   }
// };

export const addCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, source, notes, skills, experience } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !position) {
      // Remove uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: "First name, last name, email, and position are required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: "Candidate already exists in system",
        existingCandidate: {
          id: existingCandidate._id,
          name: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
          status: existingCandidate.status,
          position: existingCandidate.position,
          createdAt: existingCandidate.createdAt
        }
      });
    }

    // Create new candidate
    const candidate = await Candidate.create({
      firstName,
      lastName,
      email,
      phone,
      position,
      source,
      notes,
      experience,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
      cv: req.file ? `/uploads/cv/${req.file.filename}` : null,
      addedBy: req.user._id,
      lastUpdatedBy: req.user._id
    });

    const populatedCandidate = await Candidate.findById(candidate._id)
      .populate('addedBy', 'name email');

    res.status(201).json({
      message: "Candidate added successfully",
      candidate: populatedCandidate
    });
  } catch (err) {
    // Remove uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// Add this new function to serve CV files
// export const getCandidateCV = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
    
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     if (!candidate.cv) {
//       return res.status(404).json({ message: "CV not found for this candidate" });
//     }

//     // Extract filename from the stored path
//     const filename = candidate.cv.split('/').pop();
//     const filePath = path.join('uploads', 'cv', filename);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "CV file not found on server" });
//     }

//     // Set appropriate headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getCandidateCV = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (!candidate.cv) {
      return res.status(404).json({ message: "CV not found for this candidate" });
    }

    // Extract filename from the stored path
    const filename = candidate.cv.split('/').pop();
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
    const filePath = path.join(uploadsDir, filename);

    console.log('Looking for CV file at:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('CV file not found at path:', filePath);
      return res.status(404).json({ 
        message: "CV file not found on server",
        storedPath: candidate.cv,
        actualPath: filePath
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return res.status(404).json({ message: "CV file is empty" });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming CV file' });
    });

    fileStream.pipe(res);

  } catch (err) {
    console.error('Error in getCandidateCV:', err);
    res.status(500).json({ 
      message: "Failed to retrieve CV",
      error: err.message 
    });
  }
};

// Quick scan for existing candidate
export const quickScan = async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required for scanning" });
    }

    const query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;

    const candidate = await Candidate.findOne(query);

    if (candidate) {
      return res.json({
        exists: true,
        candidate: {
          id: candidate._id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          phone: candidate.phone,
          status: candidate.status,
          position: candidate.position,
          experience: candidate.experience,
          currentCompany: candidate.currentCompany,
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

// Get all candidates with advanced filtering and pagination
export const getCandidates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      position,
      source,
      experienceMin,
      experienceMax,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Position filter
    if (position && position !== 'all') {
      query.position = new RegExp(position, 'i');
    }

    // Source filter
    if (source && source !== 'all') {
      query.source = source;
    }

    // Experience range filter
    if (experienceMin || experienceMax) {
      query.experience = {};
      if (experienceMin) query.experience.$gte = parseInt(experienceMin);
      if (experienceMax) query.experience.$lte = parseInt(experienceMax);
    }

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { currentCompany: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const candidates = await Candidate.find(query)
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Candidate.countDocuments(query);

    // Get statistics
    const stats = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      candidates,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get candidate by ID with full details
export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Get interview history
    const interviews = await Interview.find({ candidate: req.params.id })
      .populate('scheduledBy', 'name email')
      .sort({ interviewDate: -1 });

    res.json({
      candidate,
      interviews,
      interviewCount: interviews.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update candidate
// export const updateCandidate = async (req, res) => {
//   try {
//     const {
//       firstName, lastName, email, phone, position, source, resume, notes,
//       experience, skills, currentCompany, expectedSalary, noticePeriod
//     } = req.body;

//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     // Check if email is being changed and if it already exists
//     if (email && email !== candidate.email) {
//       const existingCandidate = await Candidate.findOne({ email });
//       if (existingCandidate && existingCandidate._id.toString() !== req.params.id) {
//         return res.status(400).json({
//           message: "Email already exists in system"
//         });
//       }
//     }

//     // Update fields
//     const updateFields = {
//       firstName: firstName || candidate.firstName,
//       lastName: lastName || candidate.lastName,
//       email: email || candidate.email,
//       phone: phone || candidate.phone,
//       position: position || candidate.position,
//       source: source || candidate.source,
//       resume: resume || candidate.resume,
//       notes: notes || candidate.notes,
//       experience: experience !== undefined ? experience : candidate.experience,
//       skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : candidate.skills,
//       currentCompany: currentCompany || candidate.currentCompany,
//       expectedSalary: expectedSalary || candidate.expectedSalary,
//       noticePeriod: noticePeriod || candidate.noticePeriod,
//       lastUpdatedBy: req.user._id,
//       updatedAt: new Date()
//     };

//     const updatedCandidate = await Candidate.findByIdAndUpdate(
//       req.params.id,
//       updateFields,
//       { new: true, runValidators: true }
//     ).populate('addedBy', 'name email')
//       .populate('lastUpdatedBy', 'name email');

//     res.json({
//       message: "Candidate updated successfully",
//       candidate: updatedCandidate
//     });
//   } catch (err) {
//     if (err.name === 'ValidationError') {
//       const errors = Object.values(err.errors).map(error => error.message);
//       return res.status(400).json({ message: errors.join(', ') });
//     }
//     res.status(500).json({ message: err.message });
//   }
// };


// Update candidate
// export const updateCandidate = async (req, res) => {
//   try {
//     const {
//       firstName, lastName, email, phone, position, source, notes,
//       experience, skills, currentCompany, expectedSalary, noticePeriod
//     } = req.body;

//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     // Check if email is being changed and already exists
//     if (email && email !== candidate.email) {
//       const existingCandidate = await Candidate.findOne({ email });
//       if (existingCandidate && existingCandidate._id.toString() !== req.params.id) {
//         return res.status(400).json({ message: "Email already exists in system" });
//       }
//     }

//     const updateFields = {
//       firstName: firstName || candidate.firstName,
//       lastName: lastName || candidate.lastName,
//       email: email || candidate.email,
//       phone: phone || candidate.phone,
//       position: position || candidate.position,
//       source: source || candidate.source,
//       notes: notes || candidate.notes,
//       experience: experience !== undefined ? experience : candidate.experience,
//       skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : candidate.skills,
//       currentCompany: currentCompany || candidate.currentCompany,
//       expectedSalary: expectedSalary || candidate.expectedSalary,
//       noticePeriod: noticePeriod || candidate.noticePeriod,
//       lastUpdatedBy: req.user._id,
//       updatedAt: new Date()
//     };

//     // If new CV uploaded
//     if (req.file) {
//       updateFields.cv = `/uploads/cv/${req.file.filename}`;
//     }

//     const updatedCandidate = await Candidate.findByIdAndUpdate(
//       req.params.id,
//       updateFields,
//       { new: true, runValidators: true }
//     ).populate('addedBy', 'name email')
//      .populate('lastUpdatedBy', 'name email');

//     res.json({
//       message: "Candidate updated successfully",
//       candidate: updatedCandidate
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Update candidate with CV handling
export const updateCandidate = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, position, source, notes,
      experience, skills, currentCompany, expectedSalary, noticePeriod
    } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if email is being changed and already exists
    if (email && email !== candidate.email) {
      const existingCandidate = await Candidate.findOne({ email });
      if (existingCandidate && existingCandidate._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Email already exists in system" });
      }
    }

    // Store old CV path for cleanup
    let oldCVPath = null;
    if (req.file && candidate.cv) {
      oldCVPath = path.join('uploads', 'cv', candidate.cv.split('/').pop());
    }

    const updateFields = {
      firstName: firstName || candidate.firstName,
      lastName: lastName || candidate.lastName,
      email: email || candidate.email,
      phone: phone || candidate.phone,
      position: position || candidate.position,
      source: source || candidate.source,
      notes: notes || candidate.notes,
      experience: experience !== undefined ? experience : candidate.experience,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : candidate.skills,
      currentCompany: currentCompany || candidate.currentCompany,
      expectedSalary: expectedSalary || candidate.expectedSalary,
      noticePeriod: noticePeriod || candidate.noticePeriod,
      lastUpdatedBy: req.user._id,
      updatedAt: new Date()
    };

    // If new CV uploaded
    if (req.file) {
      updateFields.cv = `/uploads/cv/${req.file.filename}`;
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email')
     .populate('lastUpdatedBy', 'name email');

    // Remove old CV file after successful update
    if (oldCVPath && fs.existsSync(oldCVPath)) {
      fs.unlinkSync(oldCVPath);
    }

    res.json({
      message: "Candidate updated successfully",
      candidate: updatedCandidate
    });
  } catch (err) {
    // Remove uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
};


// Update candidate status
export const updateCandidateStatus = async (req, res) => {
  try {
    const { status, rejectionReason, terminationReason, notes } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const updateData = {
      status,
      lastUpdatedBy: req.user._id,
      updatedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectionDate = new Date();
    }

    if (status === 'terminated' && terminationReason) {
      updateData.terminationReason = terminationReason;
      updateData.terminationDate = new Date();
    }

    if (notes) {
      updateData.notes = candidate.notes ?
        `${candidate.notes}\n[${new Date().toLocaleString()}] Status changed to ${status}: ${notes}`
        : `[${new Date().toLocaleString()}] Status changed to ${status}: ${notes}`;
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('lastUpdatedBy', 'name email');

    res.json({
      message: "Candidate status updated successfully",
      candidate: updatedCandidate
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete candidate
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if candidate has interviews
    const interviewCount = await Interview.countDocuments({ candidate: req.params.id });
    if (interviewCount > 0) {
      return res.status(400).json({
        message: "Cannot delete candidate with existing interviews. Please cancel interviews first."
      });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.json({
      message: "Candidate deleted successfully",
      deletedCandidate: {
        id: candidate._id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk operations
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { candidateIds, status, reason } = req.body;

    if (!candidateIds || !candidateIds.length) {
      return res.status(400).json({ message: "No candidates selected" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updateData = { status, lastUpdatedBy: req.user._id };

    if (status === 'rejected' && reason) {
      updateData.rejectionReason = reason;
      updateData.rejectionDate = new Date();
    }

    const result = await Candidate.updateMany(
      { _id: { $in: candidateIds } },
      updateData
    );

    res.json({
      message: `Status updated for ${result.modifiedCount} candidates`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get candidate analytics
export const getCandidateAnalytics = async (req, res) => {
  try {
    const analytics = await Candidate.aggregate([
      {
        $facet: {
          statusDistribution: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          sourceDistribution: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          positionDistribution: [
            { $group: { _id: '$position', count: { $sum: 1 } } }
          ],
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);

    res.json(analytics[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export candidates to CSV
export const exportCandidates = async (req, res) => {
  try {
    const { status, format = 'csv' } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const candidates = await Candidate.find(query)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = candidates.map(candidate => ({
        Name: `${candidate.firstName} ${candidate.lastName}`,
        Email: candidate.email,
        Phone: candidate.phone || '',
        Position: candidate.position,
        Status: candidate.status,
        Source: candidate.source || '',
        Experience: candidate.experience || '',
        CurrentCompany: candidate.currentCompany || '',
        ExpectedSalary: candidate.expectedSalary || '',
        NoticePeriod: candidate.noticePeriod || '',
        Skills: candidate.skills?.join(', ') || '',
        AddedBy: candidate.addedBy?.name || '',
        CreatedAt: candidate.createdAt.toISOString().split('T')[0],
        LastUpdated: candidate.updatedAt.toISOString().split('T')[0]
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=candidates-${new Date().toISOString().split('T')[0]}.csv`);

      // Convert to CSV
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).map(field => `"${field}"`).join(','));
      const csv = [headers, ...rows].join('\n');

      res.send(csv);
    } else {
      res.json({ candidates });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add this to your candidate.controller.js
export const getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const newCandidates = await Candidate.countDocuments({ status: 'new' });
    const interviewedCandidates = await Candidate.countDocuments({ status: 'scheduled' });
    const hiredCandidates = await Candidate.countDocuments({ status: 'hired' });
    const rejectedCandidates = await Candidate.countDocuments({ status: 'rejected' });

    // Get today's interviews
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInterviews = await Interview.countDocuments({
      interviewDate: { $gte: today, $lt: tomorrow }
    });

    // Get upcoming interviews (future dates)
    const upcomingInterviews = await Interview.countDocuments({
      interviewDate: { $gte: new Date() }
    });

    res.json({
      totalCandidates,
      newCandidates,
      interviewedCandidates,
      hiredCandidates,
      rejectedCandidates,
      todayInterviews,
      upcomingInterviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add this function to your interview controller
export const getCandidatesWithoutInterviews = async (req, res) => {
  try {
    // Get all candidates with scheduled interviews
    const interviews = await Interview.find({ status: 'scheduled' }).select('candidate');
    const scheduledCandidateIds = interviews.map(interview => interview.candidate.toString());

    // Find candidates not in the scheduled list
    const availableCandidates = await Candidate.find({
      _id: { $nin: scheduledCandidateIds }
    }).select('firstName lastName email position');

    res.json({ candidates: availableCandidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get only new candidates for scheduling interviews
export const getNewCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: 'new' })
      .select('firstName lastName email position')
      .sort({ createdAt: -1 });

    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};