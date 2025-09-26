import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Candidate from "../models/candidate.model.js";
import Interview from "../models/interview.model.js";
import moment from "moment";
import fs from "fs";
import path from "path";

class ReportController {
    static async downloadCandidatesReport(req, res) {
        try {
            const candidates = await Candidate.find()
                .populate("addedBy", "firstName lastName email")
                .populate("lastUpdatedBy", "firstName lastName email")
                .lean();

            const doc = new PDFDocument({ margin: 40, size: "A4" });

            // --- RESPONSE HEADERS ---
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Candidates_Details_Report.pdf"
            );

            doc.pipe(res);

            // --- HEADER (Logo + Title + Date) ---
            const logoPath = path.join(process.cwd(), "src", "images", "company_logo.jpg");
            const headerY = 30;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 80 });
            } else {
                console.warn("Logo not found at:", logoPath);
            }

            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text("Candidates Details Report", 0, headerY + 20, { align: "center" });

            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica")
                .fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, headerY + 45, { align: "center" });

            doc.moveDown(5);

            // --- TABLE HEADERS ---
            const tableTop = doc.y;
            const colWidths = [20, 80,150, 60,100, 60, 60];
            const headers = ["No", "Name", "Email", "Phone", "Position", "Status", "Source"];

            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, { width: colWidths[i] - 6 });
                x += colWidths[i];
            });
            doc.fillColor("black");

            // --- TABLE ROWS ---
            let y = tableTop + 20;
            candidates.forEach((c, i) => {
                x = 40;
                const rowHeight = 40;

                // Alternate row background
                if (i % 2 === 0) {
                    doc.rect(40, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fill("#f2f2f2")
                        .fillColor("black");
                }

                const row = [
                    i + 1,
                    `${c.firstName} ${c.lastName}`,
                    c.email || "N/A",
                    c.phone || "N/A",
                    c.position || "N/A",
                    c.status || "N/A",
                    c.source || "N/A",
                ];

                row.forEach((cell, j) => {
                    doc.font("Helvetica").fontSize(9).fillColor("black");
                    doc.text(cell.toString(), x + 3, y + 6, { width: colWidths[j] - 6 });
                    x += colWidths[j];
                });

                y += rowHeight;

                if (y > doc.page.height - 80) {
                    doc.addPage();
                    y = 40;
                }
            });

            // --- SUMMARY BELOW TABLE ---
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`Total Candidates: ${candidates.length}`, 40, y + 20);

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

    static async downloadInterviewsReport(req, res) {
        try {
            const interviews = await Interview.find()
                .populate("candidate", "firstName lastName email phone position")
                .populate("scheduledBy", "firstName lastName email")
                .lean();

            const doc = new PDFDocument({ margin: 40, size: "A4" });

            // --- RESPONSE HEADERS ---
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Interviews_Report.pdf"
            );

            doc.pipe(res);

            // --- HEADER (Logo + Title + Date) ---
            const logoPath = path.join(process.cwd(), "src", "images", "company_logo.jpg");
            const headerY = 30;

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, headerY, { width: 80 });
            } else {
                console.warn("Logo not found at:", logoPath);
            }

            doc.font("Helvetica-Bold")
                .fontSize(18)
                .text("Interviews Details Report", 0, headerY + 20, { align: "center" });

            const generatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
            doc.font("Helvetica")
                .fontSize(10)
                .text(`Report Generated: ${generatedDate}`, 0, headerY + 45, { align: "center" });

            doc.moveDown(5);

            // --- TABLE HEADERS ---
            const tableTop = doc.y;
            const colWidths = [20, 100, 80, 80, 80, 80, 60];
            const headers = ["No", "Candidate Name", "Email", "Phone", "Interview Date", "Type", "Status"];

            let x = 40;
            doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 20)
                .fill("#0074D9")
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(10);

            headers.forEach((header, i) => {
                doc.text(header, x + 3, tableTop + 6, { width: colWidths[i] - 6 });
                x += colWidths[i];
            });
            doc.fillColor("black");

            // --- TABLE ROWS ---
            let y = tableTop + 20;
            interviews.forEach((iData, i) => {
                x = 40;
                const rowHeight = 40;

                if (i % 2 === 0) {
                    doc.rect(40, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                        .fill("#f2f2f2")
                        .fillColor("black");
                }

                const candidateName = iData.candidate
                    ? `${iData.candidate.firstName} ${iData.candidate.lastName}`
                    : "N/A";

                const row = [
                    i + 1,
                    candidateName,
                    iData.candidate?.email || "N/A",
                    iData.candidate?.phone || "N/A",
                    iData.interviewDate ? new Date(iData.interviewDate).toLocaleString() : "N/A",
                    iData.interviewType || "N/A",
                    iData.status || "N/A",
                ];

                row.forEach((cell, j) => {
                    doc.font("Helvetica").fontSize(9).fillColor("black");
                    doc.text(cell.toString(), x + 3, y + 6, { width: colWidths[j] - 6 });
                    x += colWidths[j];
                });

                y += rowHeight;

                if (y > doc.page.height - 80) {
                    doc.addPage();
                    y = 40;
                }
            });

            // --- SUMMARY BELOW TABLE ---
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`Total Interviews: ${interviews.length}`, 40, y + 20);

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
