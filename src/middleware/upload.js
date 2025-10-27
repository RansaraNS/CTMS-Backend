// import multer from "multer";
// import fs from "fs";
// import path from "path";

// // Upload folder path
// const uploadPath = path.join("uploads", "cv");

// // 1️⃣ Ensure folder exists
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// // 2️⃣ Storage engine with duplicate-safe filenames
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const originalName = file.originalname.replace(/\s+/g, "_"); // replace spaces with underscores
//     cb(null, `${timestamp}-${originalName}`);
//   },
// });

// // 3️⃣ File filter (PDF only)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed"));
//   }
// };

// // 4️⃣ Multer instance
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB limit
// });

// // 5️⃣ Error handling middleware
// export const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     // Multer-specific errors
//     return res.status(400).json({ message: err.message });
//   } else if (err) {
//     // General errors
//     return res.status(400).json({ message: err.message });
//   }
//   next();
// };

// export default upload;


import multer from "multer";
import fs from "fs";
import path from "path";

// Upload folder path
const uploadPath = path.join("uploads", "cv");

// 1️⃣ Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 2️⃣ Storage engine with duplicate-safe filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name.replace(/\s+/g, "_");
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${originalName}${extension}`);
  },
});

// 3️⃣ File filter (PDF only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// 4️⃣ Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file
  },
});

// 5️⃣ Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 10MB allowed.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Only one file allowed.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // General errors
    return res.status(400).json({ message: err.message });
  }
  next();
};

export default upload;