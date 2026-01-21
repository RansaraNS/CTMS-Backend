import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import moment from "moment";
import fs from "fs";
import path from "path";

class ReportController {

    static async CandidatesReport(req, res) {
        try {
            const candidates = await Candidate.find()
                .populate("addedBy", "firstName lastName email")
                .populate("lastUpdatedBy", "firstName lastName email")
                .lean();

            // ✅ Return JSON instead of PDF
            return res.status(200).json({
                success: true,
                count: candidates.length,
                data: candidates,
            });

        } catch (error) {
            console.error("❌ JSON Response Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch candidates data",
            });
        }
    }

    static async downloadCandidatesReport(req, res) {
        try {
            const candidates = await Candidate.find()
                .populate("addedBy", "firstName lastName email")
                .populate("lastUpdatedBy", "firstName lastName email")
                .lean();

            const doc = new PDFDocument({ 
                margin: 30, 
                size: "A4",
                bufferPages: true 
            });

            // Response Headers
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Candidates_Details_Report.pdf"
            );

            doc.pipe(res);

            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // ===== HEADER SECTION =====
            const logoPath = path.join(process.cwd(), "src", "images", "company_logo.jpg");
            
            // Add logo
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 40, { width: 50, height: 50 });
                } catch (error) {
                    console.error('Error adding logo:', error);
                }
            }

            // Company Name
            doc.font("Helvetica-Bold")
                .fontSize(22)
                .fillColor("#000000")
                .text("Gamage Recruiters (PVT) Ltd.", 108, 45);

            // Company Details
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#000000")
                .text("612A, Galle Road, Panadura, Sri Lanka. | gamagerecruiters@gmail.com", 110, 70);

            // Report Title
            doc.font("Helvetica")
                .fontSize(10)
                .fillColor("#000000")
                .text("Candidates Details Report", 110, 85);

            // Summary Box (Right Side)
            const summaryX = pageWidth - 150;
            
            doc.font("Helvetica-Bold")
                .fontSize(9)
                .fillColor("#000000")
                .text("Report Summary", summaryX, 45);

            const generatedDate = moment().format("YYYY-MM-DD");
            const generatedTime = moment().format("HH:mm:ss");
            
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#000000")
                .text(`Generated: ${generatedDate}`, summaryX, 60)
                .text(`Time: ${generatedTime}`, summaryX, 73)
                .text(`Total Records: ${candidates.length}`, summaryX, 86);

            // Decorative Lines
            doc.strokeColor("#050C9C")
                .lineWidth(1.5)
                .moveTo(50, 110)
                .lineTo(pageWidth - 50, 110)
                .stroke();

            doc.strokeColor("#3ABEF9")
                .lineWidth(0.8)
                .moveTo(50, 112)
                .lineTo(pageWidth - 50, 112)
                .stroke();

            // ===== STATUS SUMMARY =====
            const statusCounts = candidates.reduce((acc, c) => {
                acc[c.status] = (acc[c.status] || 0) + 1;
                return acc;
            }, {});

            let statsY = 125;
            let statsX = 50;
            
            // ===== TABLE =====
            const tableTop = statsY;
            const colWidths = [25, 80, 130, 60, 90, 60, 55];
            const headers = ["No", "Name", "Email", "Phone", "Position", "Status", "Source"];

            // Table Header
            let x = 50;
            doc.rect(50, tableTop, colWidths.reduce((a, b) => a + b, 0), 25)
                .fillAndStroke("#ffffff", "#3572EF");

            doc.font("Helvetica-Bold")
                .fontSize(9)
                .fillColor("#000000");

            headers.forEach((header, i) => {
                doc.text(header, x + 5, tableTop + 8, { 
                    width: colWidths[i] - 10, 
                    align: "center" 
                });
                x += colWidths[i];
            });

            // Table Rows
            let y = tableTop + 25;
            const rowHeight = 35;

            candidates.forEach((c, i) => {
                // Check if we need a new page
                if (y > pageHeight - 100) {
                    doc.addPage();
                    y = 50;
                }

                x = 50;

                // Alternating row colors
                if (i % 2 === 0) {
                    doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fillAndStroke("#F7FAFC", "#E2E8F0")
                        .lineWidth(0.5);
                } else {
                    doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fillAndStroke("#FFFFFF", "#E2E8F0")
                        .lineWidth(0.5);
                }

                // No column with special styling
                doc.rect(50, y, colWidths[0], rowHeight)
                    .fillAndStroke("#ffffff", "#3572EF")
                    .lineWidth(0.5);

                const row = [
                    { text: (i + 1).toString(), color: "#050C9C", bold: true },
                    { text: `${c.firstName} ${c.lastName}`, color: "#000000", bold: true },
                    { text: c.email || "N/A", color: "#4A5568", bold: false },
                    { text: c.phone || "N/A", color: "#4A5568", bold: false },
                    { text: c.position || "N/A", color: "#3572EF", bold: false },
                    { text: c.status || "N/A", color: "#000000", bold: true },
                    { text: c.source || "N/A", color: "#4A5568", bold: false }
                ];

                row.forEach((cell, j) => {
                    const font = cell.bold ? "Helvetica-Bold" : "Helvetica";
                    doc.font(font)
                        .fontSize(8)
                        .fillColor(cell.color);

                    const textY = y + (rowHeight - 8) / 2;
                    const align = j === 0 ? "center" : "left";
                    
                    doc.text(cell.text, x + 5, textY, { 
                        width: colWidths[j] - 10,
                        align: align,
                        ellipsis: true
                    });
                    x += colWidths[j];
                });

                y += rowHeight;
            });

            // ===== FOOTER =====
            const footerY = pageHeight - 70;
            const footerY2 = pageHeight - 55;

            // Decorative line
            doc.strokeColor("#3ABEF9")
                .lineWidth(1.0)
                .moveTo(50, footerY)
                .lineTo(pageWidth - 50, footerY)
                .stroke();

            // Footer text
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#718096")
                .text(
                    "Generated by Candidate Tracking Management System",
                    0,
                    footerY2,
                    { align: "center", width: pageWidth }
                );

            const year = new Date().getFullYear();
            doc.fontSize(7)
                .fillColor("#A0AEC0")
                .text(
                    `© ${year} GR IT Solutions. All rights reserved.`,
                    0,
                    footerY2 + 10,
                    { align: "center", width: pageWidth }
                );

            doc.end();

        } catch (error) {
            console.error("❌ PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download Candidates PDF report",
                });
            }
        }
    }

    static async downloadCandidatesExcel(req, res) {
        try {
            const candidates = await Candidate.find()
                .populate("addedBy", "firstName lastName email")
                .populate("lastUpdatedBy", "firstName lastName email")
                .lean();

            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Candidates Report");

            // --- HEADER ROW ---
            worksheet.columns = [
                { header: "No", key: "no", width: 5 },
                { header: "Name", key: "name", width: 25 },
                { header: "Email", key: "email", width: 30 },
                { header: "Phone", key: "phone", width: 15 },
                { header: "Position", key: "position", width: 20 },
                { header: "Status", key: "status", width: 15 },
                { header: "Source", key: "source", width: 15 },
            ];

            // --- ADD ROWS ---
            candidates.forEach((c, index) => {
                worksheet.addRow({
                    no: index + 1,
                    name: `${c.firstName} ${c.lastName}`,
                    email: c.email || "N/A",
                    phone: c.phone || "N/A",
                    position: c.position || "N/A",
                    status: c.status || "N/A",
                    source: c.source || "N/A",
                });
            });

            // Style header row
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });

            // --- SUMMARY ROW ---
            const lastRow = worksheet.lastRow.number + 2;
            worksheet.mergeCells(`A${lastRow}:G${lastRow}`);
            worksheet.getCell(`A${lastRow}`).value = `Total Candidates: ${candidates.length}`;
            worksheet.getCell(`A${lastRow}`).font = { bold: true };
            worksheet.getCell(`A${lastRow}`).alignment = { horizontal: "left" };

            // --- RESPONSE HEADERS ---
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Candidates_Report.xlsx"
            );

            // Write workbook to response
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error("❌ Excel Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download Candidates Excel report",
                });
            }
        }
    }

    static async InterviewsReport(req, res) {
        try {
            const interviews = await Interview.find()
                .populate("candidate", "firstName lastName email phone position")
                .populate("scheduledBy", "firstName lastName email")
                .lean();

            // ✅ Return JSON instead of PDF
            return res.status(200).json({
                success: true,
                count: interviews.length,
                data: interviews.map((iData, index) => ({
                    no: index + 1,
                    candidateName: iData.candidate
                        ? `${iData.candidate.firstName} ${iData.candidate.lastName}`
                        : "N/A",
                    email: iData.candidate?.email || "N/A",
                    phone: iData.candidate?.phone || "N/A",
                    interviewDate: iData.interviewDate
                        ? new Date(iData.interviewDate).toISOString()
                        : "N/A",
                    interviewType: iData.interviewType || "N/A",
                    status: iData.status || "N/A",
                         interviewer: iData.interviewers && iData.interviewers.length > 0 
                        ? iData.interviewers.join(", ") 
                        : "N/A",
                })),
            });

        } catch (error) {
            console.error("❌ JSON Response Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch Interviews data",
            });
        }
    }




    static async downloadInterviewsReport(req, res) {
        try {
            const interviews = await Interview.find()
                .populate("candidate", "firstName lastName email phone position")
                .populate("scheduledBy", "firstName lastName email")
                .lean();

            const doc = new PDFDocument({ 
                margin: 30, 
                size: "A4",
                bufferPages: true 
            });

            // Response Headers
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Interviews_Details_Report.pdf"
            );

            doc.pipe(res);

            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // ===== HEADER SECTION =====
            const logoPath = path.join(process.cwd(), "src", "images", "company_logo.jpg");
            
            // Add logo
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 40, { width: 50, height: 50 });
                } catch (error) {
                    console.error('Error adding logo:', error);
                }
            }

            // Company Name
            doc.font("Helvetica-Bold")
                .fontSize(22)
                .fillColor("#000000")
                .text("Gamage Recruiters (PVT) Ltd.", 108, 45);

            // Company Details
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#000000")
                .text("612A, Galle Road, Panadura, Sri Lanka. | gamagerecruiters@gmail.com", 110, 70);

            // Report Title
            doc.font("Helvetica")
                .fontSize(10)
                .fillColor("#000000")
                .text("Interviews Details Report", 110, 85);

            // Summary Box (Right Side)
            const summaryX = pageWidth - 150;
            
            doc.font("Helvetica-Bold")
                .fontSize(9)
                .fillColor("#000000")
                .text("Report Summary", summaryX, 45);

            const generatedDate = moment().format("YYYY-MM-DD");
            const generatedTime = moment().format("HH:mm:ss");
            
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#000000")
                .text(`Generated: ${generatedDate}`, summaryX, 60)
                .text(`Time: ${generatedTime}`, summaryX, 73)
                .text(`Total Records: ${interviews.length}`, summaryX, 86);

            // Decorative Lines
            doc.strokeColor("#050C9C")
                .lineWidth(1.5)
                .moveTo(50, 110)
                .lineTo(pageWidth - 50, 110)
                .stroke();

            doc.strokeColor("#3ABEF9")
                .lineWidth(0.8)
                .moveTo(50, 112)
                .lineTo(pageWidth - 50, 112)
                .stroke();

            // ===== STATUS SUMMARY =====
            const statusCounts = interviews.reduce((acc, i) => {
                acc[i.status] = (acc[i.status] || 0) + 1;
                return acc;
            }, {});

            let statsY = 125;
            let statsX = 50;
            

            // ===== TABLE =====
            const tableTop = statsY;
            const colWidths = [25, 90, 110, 60, 90, 70, 55];
            const headers = ["No", "Candidate", "Email", "Phone", "Date", "Type", "Status"];

            // Table Header
            let x = 50;
            doc.rect(50, tableTop, colWidths.reduce((a, b) => a + b, 0), 25)
                .fillAndStroke("#ffffff", "#3572EF");

            doc.font("Helvetica-Bold")
                .fontSize(9)
                .fillColor("#000000");

            headers.forEach((header, i) => {
                doc.text(header, x + 5, tableTop + 8, { 
                    width: colWidths[i] - 10, 
                    align: "center" 
                });
                x += colWidths[i];
            });

            // Table Rows
            let y = tableTop + 25;
            const rowHeight = 35;

            interviews.forEach((iData, i) => {
                // Check if we need a new page
                if (y > pageHeight - 100) {
                    doc.addPage();
                    y = 50;
                }

                x = 50;

                // Alternating row colors
                if (i % 2 === 0) {
                    doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fillAndStroke("#F7FAFC", "#E2E8F0")
                        .lineWidth(0.5);
                } else {
                    doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fillAndStroke("#FFFFFF", "#E2E8F0")
                        .lineWidth(0.5);
                }

                // No column with special styling
                doc.rect(50, y, colWidths[0], rowHeight)
                    .fillAndStroke("#ffffff", "#3572EF")
                    .lineWidth(0.5);

                const candidateName = iData.candidate
                    ? `${iData.candidate.firstName} ${iData.candidate.lastName}`
                    : "N/A";

                const interviewDate = iData.interviewDate 
                    ? moment(iData.interviewDate).format("MMM DD, YYYY HH:mm")
                    : "N/A";

                const row = [
                    { text: (i + 1).toString(), color: "#050C9C", bold: true },
                    { text: candidateName, color: "#000000", bold: true },
                    { text: iData.candidate?.email || "N/A", color: "#4A5568", bold: false },
                    { text: iData.candidate?.phone || "N/A", color: "#4A5568", bold: false },
                    { text: interviewDate, color: "#3572EF", bold: false },
                    { text: iData.interviewType || "N/A", color: "#000000", bold: false },
                    { text: iData.status || "N/A", color: "#000000", bold: true }
                ];

                row.forEach((cell, j) => {
                    const font = cell.bold ? "Helvetica-Bold" : "Helvetica";
                    doc.font(font)
                        .fontSize(8)
                        .fillColor(cell.color);

                    const textY = y + (rowHeight - 8) / 2;
                    const align = j === 0 ? "center" : "left";
                    
                    doc.text(cell.text, x + 5, textY, { 
                        width: colWidths[j] - 10,
                        align: align,
                        ellipsis: true
                    });
                    x += colWidths[j];
                });

                y += rowHeight;
            });

            // ===== FOOTER =====
            const footerY = pageHeight - 70;
            const footerY2 = pageHeight - 55;

            // Decorative line
            doc.strokeColor("#3ABEF9")
                .lineWidth(1.0)
                .moveTo(50, footerY)
                .lineTo(pageWidth - 50, footerY)
                .stroke();

            // Footer text
            doc.font("Helvetica")
                .fontSize(8)
                .fillColor("#718096")
                .text(
                    "Generated by Candidate Tracking Management System",
                    0,
                    footerY2,
                    { align: "center", width: pageWidth }
                );

            const year = new Date().getFullYear();
            doc.fontSize(7)
                .fillColor("#A0AEC0")
                .text(
                    `© ${year} GR IT Solutions. All rights reserved.`,
                    0,
                    footerY2 + 10,
                    { align: "center", width: pageWidth }
                );

            doc.end();

        } catch (error) {
            console.error("❌ PDF Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download Interviews PDF report",
                });
            }
        }
    }

    static async downloadInterviewsExcel(req, res) {
        try {
            const interviews = await Interview.find()
                .populate("candidate", "firstName lastName email phone position")
                .populate("scheduledBy", "firstName lastName email")
                .lean();

            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Interviews Report");

            // Add header row
            worksheet.columns = [
                { header: "No", key: "no", width: 5 },
                { header: "Candidate Name", key: "candidateName", width: 25 },
                { header: "Email", key: "email", width: 30 },
                { header: "Phone", key: "phone", width: 15 },
                { header: "Position", key: "position", width: 20 },
                { header: "Interview Date", key: "interviewDate", width: 25 },
                { header: "Type", key: "interviewType", width: 15 },
                { header: "Status", key: "status", width: 15 },
            ];

            // Add rows
            interviews.forEach((iData, index) => {
                const candidateName = iData.candidate
                    ? `${iData.candidate.firstName} ${iData.candidate.lastName}`
                    : "N/A";

                worksheet.addRow({
                    no: index + 1,
                    candidateName,
                    email: iData.candidate?.email || "N/A",
                    phone: iData.candidate?.phone || "N/A",
                    position: iData.candidate?.position || "N/A",
                    interviewDate: iData.interviewDate
                        ? new Date(iData.interviewDate).toLocaleString()
                        : "N/A",
                    interviewType: iData.interviewType || "N/A",
                    status: iData.status || "N/A",
                });
            });

            // Style header row
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });

            // Set response headers
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Interviews_Report.xlsx"
            );

            // Write workbook to response
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error("❌ Excel Generation Error:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download Interviews Excel report",
                });
            }
        }
    }

    static async downloadCandidateInterviewsReport(req, res) {
        try {
            const { candidateId } = req.params;

            if (!candidateId) return res.status(400).json({ message: "candidateId is required" });

            const candidate = await Candidate.findById(candidateId)
                .populate("addedBy", "firstName lastName email")
                .populate("lastUpdatedBy", "firstName lastName email")
                .lean();

            if (!candidate) return res.status(404).json({ message: "Candidate not found" });

            const interviews = await Interview.find({ candidate: candidateId })
                .sort({ interviewDate: 1 })
                .lean();

            const doc = new PDFDocument({ margin: 50, size: "A4" });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${candidate.firstName}_${candidate.lastName}_Interviews_Report.pdf`
            );

            doc.pipe(res);

            // --- HEADER ---
            const logoPath = path.join(process.cwd(), "src", "images", "company_logo.jpg");
            if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 30, { width: 50 });

            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text(`${candidate.firstName} ${candidate.lastName} - Interviews Report`, 0, 40, { align: "center" });

            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica").fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, 65, { align: "center" });

            doc.moveDown(3);

            // --- CANDIDATE DETAILS (Aligned with table) ---
            const startX = 50;
            doc.font("Helvetica-Bold").fontSize(12).text("Candidate Details:", startX, doc.y, { underline: true });
            const detailsY = doc.y + 5;
            doc.font("Helvetica").fontSize(10)
                .text(`Name: ${candidate.firstName} ${candidate.lastName}`, startX, detailsY)
                .text(`Email: ${candidate.email || "N/A"}`, startX)
                .text(`Phone: ${candidate.phone || "N/A"}`, startX)
                .text(`Position: ${candidate.position || "N/A"}`, startX)
                .text(`Status: ${candidate.status || "N/A"}`, startX);

            doc.moveDown(2);

            // --- INTERVIEWS TABLE ---
            if (interviews.length > 0) {
                doc.font("Helvetica-Bold").fontSize(12).text("Interviews:", startX, doc.y, { underline: true });

                const tableTop = doc.y + 5;
                const colWidths = [30, 170, 80, 50, 120, 70]; // No, Interviewers, Date, Type, Meeting Link, Status
                const headers = ["No", "Interviewers", "Date", "Type", "Meeting Link", "Status"];

                // Draw table header
                let x = startX;
                doc.fillColor("#0074D9").rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 20).fill();
                doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
                headers.forEach((header, i) => {
                    doc.text(header, x + 5, tableTop + 6, { width: colWidths[i] - 10 });
                    x += colWidths[i];
                });

                // Draw table rows
                let y = tableTop + 20;
                doc.fillColor("black").font("Helvetica").fontSize(9);
                interviews.forEach((interview, i) => {
                    x = startX;
                    const rowHeight = 35;

                    // Alternating row color
                    if (i % 2 === 0) {
                        doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#f2f2f2").fillColor("black");
                    }

                    const interviewers = (interview.interviewers || []).join(", ") || "N/A";
                    const row = [
                        i + 1,
                        interviewers,
                        moment(interview.interviewDate).format("YYYY-MM-DD"),
                        interview.interviewType || "N/A",
                        interview.meetingLink || "N/A",
                        interview.status || "N/A"
                    ];

                    row.forEach((cell, j) => {
                        doc.text(cell.toString(), x + 5, y + 10, { width: colWidths[j] - 10 });
                        x += colWidths[j];
                    });

                    y += rowHeight;
                    if (y > doc.page.height - 80) {
                        doc.addPage();
                        y = 50;
                    }
                });
            } else {
                doc.font("Helvetica").fontSize(10).text("No interviews found for this candidate.", startX, doc.y + 10);
            }

            // --- SUMMARY ---
            doc.moveDown(2);
            doc.font("Helvetica-Bold").fontSize(12)
                .text(`Total Interviews: ${interviews.length}`, startX, doc.y);

            doc.end();

        } catch (error) {
            console.error("❌ PDF Generation Error:", error);
            if (!res.headersSent) res.status(500).json({ success: false, message: "Failed to generate candidate interviews PDF" });
        }
    }


}

export default ReportController;
