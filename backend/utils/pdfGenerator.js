// import PDFDocument from 'pdfkit';
// import axios from 'axios';
// import SystemSettings from '../models/SystemSettings.js';

// // Helper to fetch image buffer
// const fetchImage = async (url) => {
//     try {
//         if (!url) return null;
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         return Buffer.from(response.data, 'binary');
//     } catch (e) {
//         console.error('Error fetching image:', url);
//         return null;
//     }
// };

// // Helper to get blurred Cloudinary URL
// const getBlurredImageUrl = (url) => {
//     if (!url || !url.includes('cloudinary.com')) return url;
//     // Insert transformation after /upload/
//     const parts = url.split('/upload/');
//     if (parts.length !== 2) return url;
//     // e_blur:2000 (max blur), c_fill (crop fill), w_242, h_363 (exact size)
//     return `${parts[0]}/upload/e_blur:2000,c_fill,w_242,h_363/${parts[1]}`;
// };

// export const generateIDCardPDF = async (student, res) => {
//     const settings = await SystemSettings.findOne() || {};

//     // 1. Pre-fetch all images before starting the response
//     const [bgBuffer, blurredBgBuffer, photoBuffer, sigBuffer, regSigBuffer] = await Promise.all([
//         fetchImage(settings.idCardBackground),
//         fetchImage(getBlurredImageUrl(settings.idCardBackground)),
//         fetchImage(student.documents?.photo),
//         fetchImage(student.documents?.signature),
//         fetchImage(settings.registrarSignature)
//     ]);

//     const doc = new PDFDocument({
//         size: [242, 363],
//         margin: 0
//     });

//     // 2. Now it is safe to set headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=ID_Card_${student.prn}.pdf`);

//     doc.pipe(res);

//     const width = 242;
//     const height = 363;

//     // Background Rendering
//     let bgApplied = false;

//     // First try blurred background (Prioritize student photo blurred)
//     if (blurredBgBuffer) {
//         try {
//             doc.image(blurredBgBuffer, 0, 0, { width, height });
//             // Add a semi-transparent white overlay to make text pop
//             doc.rect(0, 0, width, height).fillOpacity(0.9).fill();
//             doc.fillOpacity(1.0); // Reset opacity for subsequent elements
//             bgApplied = true;
//         } catch (err) {
//             console.warn('Failed to apply blurred background:', err.message);
//         }
//     }

//     // Fallback to explicit background if blurred failed
//     if (!bgApplied && bgBuffer) {
//         try {
//             doc.image(bgBuffer, 0, 0, { width, height });
//             bgApplied = true;
//         } catch (err) {
//             console.warn('Failed to apply explicit background image:', err.message);
//         }
//     }

//     if (!bgApplied) {
//         doc.rect(0, 0, width, height).fill('#ffffffff');
//         doc.rect(0, 0, width, 65).fill('#1e40af');
//         doc.rect(0, height - 20, width, 20).fill('#1e40af');
//     }

//     // Header Text
//     doc.fillColor('#ffffff')
//         .fontSize(10)
//         .font('Helvetica-Bold')
//         .text('Dr. Babasaheb Technological University Lonere', 0, 15, { align: 'center', width });

//     doc.fontSize(7)
//         .font('Helvetica')
//         .text('Vidyavihar, Lonere 402104 DDist. Raigad,Maharashtra', 0, 30, { align: 'center', width });

//     doc.fillColor('#ffffff')
//         .fontSize(8)
//         .font('Helvetica-Bold')
//         .text('STUDENT IDENTITY CARD', 0, 45, { align: 'center', width });

//     // Photo with border
//     const photoSize = 85;
//     const photoX = (width - photoSize) / 2;
//     const photoY = 80;

//     doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4).fill('#ffffff');
//     doc.rect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2).stroke('#e2e8f0');

//     let photoApplied = false;
//     if (photoBuffer) {
//         try {
//             doc.image(photoBuffer, photoX, photoY, { width: photoSize, height: photoSize });
//             photoApplied = true;
//         } catch (err) {
//             console.warn('Failed to apply student photo:', err.message);
//         }
//     }

//     if (!photoApplied) {
//         doc.rect(photoX, photoY, photoSize, photoSize).fill('#f1f5f9');
//         doc.fillColor('#94a3b8').fontSize(8).text('PHOTO', photoX, photoY + 35, { width: photoSize, align: 'center' });
//     }

//     // Student Name
//     const studentName = student.name ? student.name.toUpperCase() : 'STUDENT NAME';
//     doc.fillColor('#1e40af')
//         .fontSize(12)
//         .font('Helvetica-Bold')
//         .text(studentName, 10, 175, { align: 'center', width: width - 20 });

//     // Details
//     const startY = 200;
//     const rowHeight = 15;
//     const labelX = 20;
//     const valueX = 85;

//     const drawRow = (label, value, y) => {
//         doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text(label, labelX, y);
//         doc.fillColor('#0f172a').fontSize(7).font('Helvetica').text(': ' + (value || 'N/A'), valueX, y);
//     };

//     drawRow('PRN', student.prn, startY);
//     drawRow('DEPARTMENT', student.department, startY + rowHeight);
//     drawRow('DOB', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A', startY + rowHeight * 2);
//     drawRow('BLOOD GROUP', student.bloodGroup || 'O+', startY + rowHeight * 3);
//     drawRow('MOBILE', student.phoneNumber, startY + rowHeight * 4);
//     //   drawRow('VALID UPTO', 'JUNE 2027', startY + rowHeight * 5);

//     // Address (Smaller font)
//     doc.fillColor('#64748b').fontSize(6).font('Helvetica-Bold').text('ADDRESS:', labelX, startY + rowHeight * 6.5);
//     doc.fillColor('#0f172a').fontSize(6).font('Helvetica').text(student.address || 'N/A', labelX + 40, startY + rowHeight * 6.5, { width: 150 });

//     // Signatures
//     const sigY = 305;

//     // Student Signature
//     if (sigBuffer) {
//         try {
//             doc.image(sigBuffer, 20, sigY, { width: 60, height: 20 });
//         } catch (err) {
//             console.warn('Failed to apply student signature:', err.message);
//         }
//     }
//     doc.fillColor('#475569').fontSize(6).font('Helvetica-Oblique').text('Student Sign', 25, sigY + 22);

//     // Registrar Signature
//     if (regSigBuffer) {
//         try {
//             doc.image(regSigBuffer, 160, sigY, { width: 60, height: 20 });
//         } catch (err) {
//             console.warn('Failed to apply registrar signature:', err.message);
//         }
//     }
//     const regName = settings.registrarName || 'Registrar';
//     doc.fillColor('#475569').fontSize(6).font('Helvetica-Bold').text(regName, 160, sigY + 22, { width: 60, align: 'center' });
//     doc.fontSize(5).font('Helvetica').text('Issuing Authority', 160, sigY + 30, { width: 60, align: 'center' });

//     return new Promise((resolve, reject) => {
//         res.on('finish', resolve);
//         res.on('error', reject);
//         doc.end();
//     });
// };




























// import PDFDocument from 'pdfkit';
// import axios from 'axios';
// import SystemSettings from '../models/SystemSettings.js';

// // Helper to fetch image buffer
// const fetchImage = async (url) => {
//     try {
//         if (!url) return null;
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         return Buffer.from(response.data, 'binary');
//     } catch (e) {
//         console.error('Error fetching image:', url);
//         return null;
//     }
// };

// // Helper to get blurred Cloudinary URL (IMPROVED)
// const getBlurredImageUrl = (url) => {
//     if (!url || !url.includes('cloudinary.com')) return url;

//     const parts = url.split('/upload/');
//     if (parts.length !== 2) return url;

//     // 🔥 Balanced blur (not too much)
//     return `${parts[0]}/upload/e_blur:300,c_fill,w_242,h_363/${parts[1]}`;
// };

// export const generateIDCardPDF = async (student, res) => {
//     const settings = await SystemSettings.findOne() || {};

//     // Pre-fetch images
//     const [bgBuffer, blurredBgBuffer, photoBuffer, sigBuffer, regSigBuffer] = await Promise.all([
//         fetchImage(settings.idCardBackground),
//         fetchImage(getBlurredImageUrl(settings.idCardBackground)),
//         fetchImage(student.documents?.photo),
//         fetchImage(student.documents?.signature),
//         fetchImage(settings.registrarSignature)
//     ]);

//     const doc = new PDFDocument({
//         size: [242, 363],
//         margin: 0
//     });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=ID_Card_${student.prn}.pdf`);

//     doc.pipe(res);

//     const width = 242;
//     const height = 363;

//     // =========================
//     // 🎨 BACKGROUND
//     // =========================
//     let bgApplied = false;

//     if (blurredBgBuffer) {
//         try {
//             doc.image(blurredBgBuffer, 0, 0, { width, height });

//             // ✅ LIGHT overlay (fix)
//             doc.rect(0, 0, width, height)
//                 .fillOpacity(0.3)   // ⭐ IMPORTANT CHANGE
//                 .fill('#ffffff');

//             doc.fillOpacity(1); // reset
//             bgApplied = true;
//         } catch (err) {
//             console.warn('Blurred background failed:', err.message);
//         }
//     }

//     // fallback
//     if (!bgApplied && bgBuffer) {
//         try {
//             doc.image(bgBuffer, 0, 0, { width, height });
//             bgApplied = true;
//         } catch (err) {
//             console.warn('Background failed:', err.message);
//         }
//     }

//     // final fallback (plain design)
//     if (!bgApplied) {
//         doc.rect(0, 0, width, height).fill('#ffffff');
//         doc.rect(0, 0, width, 65).fill('#1e40af');
//         doc.rect(0, height - 20, width, 20).fill('#1e40af');
//     }

//     // =========================
//     // 🏫 HEADER
//     // =========================
//     doc.fillColor('#ffffff')
//         .fontSize(10)
//         .font('Helvetica-Bold')
//         .text('Dr. Babasaheb Technological University Lonere', 0, 15, {
//             align: 'center',
//             width
//         });

//     doc.fontSize(7)
//         .font('Helvetica')
//         .text('Vidyavihar, Lonere 402104 Dist. Raigad, Maharashtra', 0, 30, {
//             align: 'center',
//             width
//         });

//     doc.fontSize(8)
//         .font('Helvetica-Bold')
//         .text('STUDENT IDENTITY CARD', 0, 45, {
//             align: 'center',
//             width
//         });

//     // =========================
//     // 🖼 PHOTO
//     // =========================
//     const photoSize = 85;
//     const photoX = (width - photoSize) / 2;
//     const photoY = 80;

//     doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4).fill('#ffffff');
//     doc.rect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2).stroke('#e2e8f0');

//     if (photoBuffer) {
//         try {
//             doc.image(photoBuffer, photoX, photoY, {
//                 width: photoSize,
//                 height: photoSize
//             });
//         } catch {
//             doc.rect(photoX, photoY, photoSize, photoSize).fill('#f1f5f9');
//         }
//     }

//     // =========================
//     // 👤 NAME
//     // =========================
//     const studentName = student.name?.toUpperCase() || 'STUDENT NAME';

//     doc.fillColor('#1e40af')
//         .fontSize(12)
//         .font('Helvetica-Bold')
//         .text(studentName, 10, 175, {
//             align: 'center',
//             width: width - 20
//         });

//     // =========================
//     // 📄 DETAILS
//     // =========================
//     const startY = 200;
//     const rowHeight = 15;

//     const drawRow = (label, value, y) => {
//         doc.fillColor('#64748b')
//             .fontSize(7)
//             .font('Helvetica-Bold')
//             .text(label, 20, y);

//         doc.fillColor('#0f172a')
//             .fontSize(7)
//             .font('Helvetica')
//             .text(': ' + (value || 'N/A'), 85, y);
//     };

//     drawRow('PRN', student.prn, startY);
//     drawRow('DEPARTMENT', student.department, startY + rowHeight);
//     drawRow('DOB', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A', startY + rowHeight * 2);
//     drawRow('BLOOD GROUP', student.bloodGroup || 'O+', startY + rowHeight * 3);
//     drawRow('MOBILE', student.phoneNumber, startY + rowHeight * 4);

//     // Address
//     doc.fillColor('#64748b')
//         .fontSize(6)
//         .font('Helvetica-Bold')
//         .text('ADDRESS:', 20, startY + rowHeight * 6.5);

//     doc.fillColor('#0f172a')
//         .fontSize(6)
//         .font('Helvetica')
//         .text(student.address || 'N/A', 60, startY + rowHeight * 6.5, {
//             width: 150
//         });

//     // =========================
//     // ✍ SIGNATURES
//     // =========================
//     const sigY = 305;

//     if (sigBuffer) {
//         doc.image(sigBuffer, 20, sigY, { width: 60, height: 20 });
//     }
//     doc.fillColor('#475569')
//         .fontSize(6)
//         .text('Student Sign', 25, sigY + 22);

//     if (regSigBuffer) {
//         doc.image(regSigBuffer, 160, sigY, { width: 60, height: 20 });
//     }

//     const regName = settings.registrarName || 'Registrar';

//     doc.fillColor('#475569')
//         .fontSize(6)
//         .text(regName, 160, sigY + 22, { align: 'center', width: 60 });

//     doc.fontSize(5)
//         .text('Issuing Authority', 160, sigY + 30, {
//             align: 'center',
//             width: 60
//         });

//     // =========================
//     // 📦 FINALIZE
//     // =========================
//     return new Promise((resolve, reject) => {
//         res.on('finish', resolve);
//         res.on('error', reject);
//         doc.end();
//     });
// };







// import PDFDocument from 'pdfkit';
// import axios from 'axios';
// import SystemSettings from '../models/SystemSettings.js';

// // =========================
// // 📥 Fetch Image
// // =========================
// const fetchImage = async (url) => {
//     try {
//         if (!url) return null;
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         return Buffer.from(response.data, 'binary');
//     } catch (e) {
//         console.error('Error fetching image:', url);
//         return null;
//     }
// };

// // =========================
// // 🪪 Generate ID Card
// // =========================
// export const generateIDCardPDF = async (student, res) => {
//     const settings = await SystemSettings.findOne() || {};

//     // Fetch only ORIGINAL images (no blur)
//     const [bgBuffer, photoBuffer, sigBuffer, regSigBuffer] = await Promise.all([
//         fetchImage(settings.idCardBackground),
//         fetchImage(student.documents?.photo),
//         fetchImage(student.documents?.signature),
//         fetchImage(settings.registrarSignature)
//     ]);

//     const doc = new PDFDocument({
//         size: [242, 363],
//         margin: 0
//     });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=ID_Card_${student.prn}.pdf`);

//     doc.pipe(res);

//     const width = 242;
//     const height = 363;

//     // =========================
//     // 🎨 PURE BACKGROUND (NO BLUR)
//     // =========================
//     let bgApplied = false;

//     if (bgBuffer) {
//         try {
//             doc.image(bgBuffer, 0, 0, {
//                 width: width,
//                 height: height
//             });
//             bgApplied = true;
//         } catch (err) {
//             console.warn('Background failed:', err.message);
//         }
//     }

//     // fallback simple design
//     if (!bgApplied) {
//         doc.rect(0, 0, width, height).fill('#ffffff');
//         doc.rect(0, 0, width, 65).fill('#1e40af');
//         doc.rect(0, height - 20, width, 20).fill('#1e40af');
//     }

//     // =========================
//     // 🏫 HEADER
//     // =========================
//     doc.fillColor('#ffffff')
//         .fontSize(10)
//         .font('Helvetica-Bold')
//         .text('Dr. Babasaheb Technological University Lonere', 0, 15, {
//             align: 'center',
//             width
//         });

//     doc.fontSize(7)
//         .font('Helvetica')
//         .text('Vidyavihar, Lonere 402104 Dist. Raigad, Maharashtra', 0, 30, {
//             align: 'center',
//             width
//         });

//     doc.fontSize(8)
//         .font('Helvetica-Bold')
//         .text('STUDENT IDENTITY CARD', 0, 45, {
//             align: 'center',
//             width
//         });

//     // =========================
//     // 📸 PHOTO
//     // =========================
//     const photoSize = 85;
//     const photoX = (width - photoSize) / 2;
//     const photoY = 80;

//     doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4).fill('#ffffff');
//     doc.rect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2).stroke('#e2e8f0');

//     if (photoBuffer) {
//         try {
//             doc.image(photoBuffer, photoX, photoY, {
//                 width: photoSize,
//                 height: photoSize
//             });
//         } catch {
//             doc.rect(photoX, photoY, photoSize, photoSize).fill('#f1f5f9');
//         }
//     } else {
//         doc.rect(photoX, photoY, photoSize, photoSize).fill('#f1f5f9');
//         doc.fillColor('#94a3b8')
//             .fontSize(8)
//             .text('PHOTO', photoX, photoY + 35, {
//                 width: photoSize,
//                 align: 'center'
//             });
//     }

//     // =========================
//     // 👤 NAME
//     // =========================
//     const studentName = student.name?.toUpperCase() || 'STUDENT NAME';

//     doc.fillColor('#1e40af')
//         .fontSize(12)
//         .font('Helvetica-Bold')
//         .text(studentName, 10, 175, {
//             align: 'center',
//             width: width - 20
//         });

//     // =========================
//     // 📄 DETAILS
//     // =========================
//     const startY = 200;
//     const rowHeight = 15;

//     const drawRow = (label, value, y) => {
//         doc.fillColor('#64748b')
//             .fontSize(7)
//             .font('Helvetica-Bold')
//             .text(label, 20, y);

//         doc.fillColor('#0f172a')
//             .fontSize(7)
//             .font('Helvetica')
//             .text(': ' + (value || 'N/A'), 85, y);
//     };

//     drawRow('PRN', student.prn, startY);
//     drawRow('DEPARTMENT', student.department, startY + rowHeight);
//     drawRow('DOB', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A', startY + rowHeight * 2);
//     drawRow('BLOOD GROUP', student.bloodGroup || 'O+', startY + rowHeight * 3);
//     drawRow('MOBILE', student.phoneNumber, startY + rowHeight * 4);

//     // Address
//     doc.fillColor('#64748b')
//         .fontSize(6)
//         .font('Helvetica-Bold')
//         .text('ADDRESS:', 20, startY + rowHeight * 6.5);

//     doc.fillColor('#0f172a')
//         .fontSize(6)
//         .font('Helvetica')
//         .text(student.address || 'N/A', 60, startY + rowHeight * 6.5, {
//             width: 150
//         });

//     // =========================
//     // ✍ SIGNATURES
//     // =========================
//     const sigY = 305;

//     if (sigBuffer) {
//         doc.image(sigBuffer, 20, sigY, { width: 60, height: 20 });
//     }
//     doc.fillColor('#475569')
//         .fontSize(6)
//         .text('Student Sign', 25, sigY + 22);

//     if (regSigBuffer) {
//         doc.image(regSigBuffer, 160, sigY, { width: 60, height: 20 });
//     }

//     const regName = settings.registrarName || 'Registrar';

//     doc.fillColor('#475569')
//         .fontSize(6)
//         .text(regName, 160, sigY + 22, { align: 'center', width: 60 });

//     doc.fontSize(5)
//         .text('Issuing Authority', 160, sigY + 30, {
//             align: 'center',
//             width: 60
//         });

//     // =========================
//     // 📦 FINALIZE
//     // =========================
//     return new Promise((resolve, reject) => {
//         res.on('finish', resolve);
//         res.on('error', reject);
//         doc.end();
//     });
// };





















import PDFDocument from 'pdfkit';
import axios from 'axios';
import SystemSettings from '../models/SystemSettings.js';

// =========================
// 🔧 FETCH IMAGE
// =========================
const fetchImage = async (url) => {
    try {
        if (!url) return null;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (e) {
        console.error('Error fetching image:', url);
        return null;
    }
};

// =========================
// 🌫 BLUR IMAGE
// =========================
const getBlurredImageUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    return `${parts[0]}/upload/e_blur:300,c_fill,w_242,h_363/${parts[1]}`;
};

// =========================
// 🎯 MAIN FUNCTION
// =========================
export const generateIDCardPDF = async (student, res) => {

    const settings = await SystemSettings.findOne() || {};

    const [bgBuffer, blurredBgBuffer, photoBuffer, sigBuffer, regSigBuffer] = await Promise.all([
        fetchImage(settings.idCardBackground),
        fetchImage(getBlurredImageUrl(settings.idCardBackground)),
        fetchImage(student.documents?.photo),
        fetchImage(student.documents?.signature),
        fetchImage(settings.registrarSignature)
    ]);

    const doc = new PDFDocument({
        size: [242, 363],
        margin: 0
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ID_Card_${student.prn}.pdf`);

    doc.pipe(res);

    const width = 242;
    const height = 363;

    // =========================
    // ✂️ SECTIONS
    // =========================
    const headerHeight = 65;
    const footerHeight = 70;
    const middleY = headerHeight;
    const middleHeight = height - headerHeight - footerHeight;

    // =========================
    // 🎨 HEADER
    // =========================
    doc.rect(0, 0, width, headerHeight).fill('#1e40af');

    // =========================
    // 🌫 MIDDLE (BLUR)
    // =========================
    if (blurredBgBuffer) {
        doc.image(blurredBgBuffer, 0, middleY, {
            width,
            height: middleHeight
        });

        doc.rect(0, middleY, width, middleHeight)
            .fillOpacity(0.25)
            .fill('#ffffff');

        doc.fillOpacity(1);
    } else if (bgBuffer) {
        doc.image(bgBuffer, 0, middleY, {
            width,
            height: middleHeight
        });
    } else {
        doc.rect(0, middleY, width, middleHeight).fill('#f8fafc');
    }

    // =========================
    // 🧾 FOOTER (WHITE AREA)
    // =========================
    doc.rect(0, height - footerHeight, width, footerHeight)
        .fill('#ffffff');

    // =========================
    // 🎨 BOTTOM STRIP (ONLY BELOW SIGNATURE)
    // =========================
    const bottomStripHeight = 15;

    doc.rect(0, height - bottomStripHeight, width, bottomStripHeight)
        .fill('#1e40af');

    // =========================
    // 🏫 HEADER TEXT
    // =========================
    doc.fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Dr. Babasaheb Technological University Lonere', 0, 15, {
            align: 'center',
            width
        });

    doc.fontSize(7)
        .font('Helvetica')
        .text('Vidyavihar, Lonere 402104 Dist. Raigad, Maharashtra', 0, 30, {
            align: 'center',
            width
        });

    doc.fontSize(8)
        .font('Helvetica-Bold')
        .text('STUDENT IDENTITY CARD', 0, 45, {
            align: 'center',
            width
        });

    // =========================
    // 🖼 PHOTO
    // =========================
    const photoSize = 85;
    const photoX = (width - photoSize) / 2;
    const photoY = 80;

    doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4).fill('#ffffff');
    doc.rect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2).stroke('#e2e8f0');

    if (photoBuffer) {
        doc.image(photoBuffer, photoX, photoY, {
            width: photoSize,
            height: photoSize
        });
    } else {
        doc.rect(photoX, photoY, photoSize, photoSize).fill('#e2e8f0');
    }

    // =========================
    // 👤 NAME
    // =========================
    const studentName = student.name?.toUpperCase() || 'STUDENT NAME';

    doc.fillColor('#1e40af')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(studentName, 10, 175, {
            align: 'center',
            width: width - 20
        });

    // =========================
    // 📄 DETAILS (BOLD + BIG)
    // =========================
    const startY = 195;
    const rowHeight = 15;

    const drawRow = (label, value, y) => {
        doc.fillColor('#475569')
            .fontSize(7)
            .font('Helvetica-Bold')
            .text(label, 18, y);

        doc.fillColor('#0f172a')
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(': ' + (value || 'N/A'), 85, y, { width: 130 });
    };

    drawRow('PRN', student.prn, startY);
    drawRow('DEPARTMENT', student.department, startY + rowHeight);
    drawRow('DOB', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A', startY + rowHeight * 2);
    drawRow('BLOOD GROUP', student.bloodGroup || 'O+', startY + rowHeight * 3);
    drawRow('MOBILE', student.phoneNumber, startY + rowHeight * 4);
    drawRow('EMAIL', student.email, startY + rowHeight * 5);

    // Address
    doc.fillColor('#475569')
        .fontSize(6)
        .font('Helvetica-Bold')
        .text('ADDRESS:', 18, startY + rowHeight * 6.5);

    doc.fillColor('#0f172a')
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(student.address || 'N/A', 70, startY + rowHeight * 6.5, {
            width: 150
        });

    // =========================
    // ✍ SIGNATURES
    // =========================
    const sigY = height - footerHeight + 10;

    if (sigBuffer) {
        doc.image(sigBuffer, 20, sigY, { width: 60, height: 20 });
    }

    doc.fillColor('#0f172a')
        .fontSize(6)
        .text('Student Sign', 25, sigY + 22);

    if (regSigBuffer) {
        doc.image(regSigBuffer, 160, sigY, { width: 60, height: 20 });
    }

    const regName = settings.registrarName || 'Registrar';

    doc.fillColor('#0f172a')
        .fontSize(6)
        .text(regName, 160, sigY + 22, {
            align: 'center',
            width: 60
        });

    doc.fontSize(5)
        .text('Issuing Authority', 160, sigY + 30, {
            align: 'center',
            width: 60
        });

    // =========================
    // 📦 FINALIZE
    // =========================
    return new Promise((resolve, reject) => {
        res.on('finish', resolve);
        res.on('error', reject);
        doc.end();
    });
};