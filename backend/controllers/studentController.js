import Student from '../models/Student.js';
import DepartmentModel from '../models/Department.js';
import Institute from '../models/Institute.js';
import { generateIDCardPDF } from '../utils/pdfGenerator.js';
import { generatePRN } from '../utils/prnGenerator.js';
import SystemSettings from '../models/SystemSettings.js';

export const getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('-password');
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);

        if (student) {
            // Only allow updates if status is Approved
            if (student.status === 'Approved') {
                return res.status(400).json({ message: 'Cannot update profile after approval' });
            }

            const settings = await SystemSettings.findOne();
            if (settings && settings.formDeadline && new Date() > settings.formDeadline) {
                return res.status(400).json({ message: 'The deadline for form submission/editing has passed.' });
            }

            const updateField = (field, value) => {
                if (value !== undefined && student[field] !== value) {
                    student[field] = value;
                    if (!student.verification) student.verification = { info: {}, documents: {} };
                    if (!student.verification.info) student.verification.info = {};
                    if (!student.verification.info[field]) student.verification.info[field] = {};

                    student.verification.info[field].status = 'Pending';
                    student.verification.info[field].message = '';
                }
            };

            updateField('name', req.body.name);
            updateField('phoneNumber', req.body.phoneNumber);
            updateField('address', req.body.address);
            updateField('aadhaarNumber', req.body.aadhaarNumber);
            updateField('gender', req.body.gender);
            updateField('dateOfBirth', req.body.dateOfBirth);
            updateField('category', req.body.category);
            updateField('isPWD', req.body.isPWD);
            updateField('bloodGroup', req.body.bloodGroup);
            updateField('department', req.body.department);
            updateField('batch', req.body.batch);
            updateField('batchYear', req.body.batchYear);
            updateField('batchCode', req.body.batchCode);
            updateField('institute', req.body.institute);
            updateField('admissionType', req.body.admissionType);
            updateField('admissionTypeCode', req.body.admissionTypeCode);

            // If it was rejected globally, moving back to Pending might be helpful but less relevant now.
            // We will keep it for backward compatibility or global status tracking.
            if (student.status === 'Rejected') {
                student.status = 'Pending';
                student.rejectionReason = '';
            }

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        // Handle duplicate Aadhaar error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.aadhaarNumber) {
            return res.status(400).json({ message: 'Aadhaar Number already registered' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const uploadDocuments = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.status === 'Approved') {
            return res.status(400).json({ message: 'Cannot upload documents after approval' });
        }

        const settings = await SystemSettings.findOne();
        if (settings && settings.formDeadline && new Date() > settings.formDeadline) {
            return res.status(400).json({ message: 'The deadline for document upload has passed.' });
        }

        const files = req.files;
        if (!files) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Initialize documents object if it doesn't exist
        if (!student.documents) student.documents = {};

        // Helper to get file URL and update verification status if new file uploaded
        const getUrl = (field) => {
            if (files[field]) {
                if (!student.verification) student.verification = { info: {}, documents: {} };
                if (!student.verification.documents) student.verification.documents = {};
                if (!student.verification.documents[field]) student.verification.documents[field] = {};

                student.verification.documents[field].status = 'Pending';
                student.verification.documents[field].message = '';
                return files[field][0].path;
            }
            return student.documents[field];
        };

        student.documents.photo = getUrl('photo');
        student.documents.signature = getUrl('signature');
        student.documents.aadhaarCard = getUrl('aadhaarCard');
        student.documents.marksheet = getUrl('marksheet');
        student.documents.allotmentLetter = getUrl('allotmentLetter');
        student.documents.leavingCertificate = getUrl('leavingCertificate');
        student.documents.feesReceipt = getUrl('feesReceipt');
        student.documents.incomeCertificate = getUrl('incomeCertificate');
        student.documents.casteCertificate = getUrl('casteCertificate');
        student.documents.casteValidity = getUrl('casteValidity');
        student.documents.pwdCertificate = getUrl('pwdCertificate');

        if (student.status === 'Rejected') {
            student.status = 'Pending';
            student.rejectionReason = '';
        }

        await student.save();
        res.json({ message: 'Documents uploaded successfully', documents: student.documents });

    } catch (error) {
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
};

export const downloadIDCard = async (req, res) => {
    try {
        const student = req.user;
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log(`Generating ID card for PRN: ${student.prn}, Status: ${student.status}`);

        console.log(`Generating ID card for PRN: ${student.prn}, Status: ${student.status}`);

        if (student.status !== 'Approved' || !student.prn) {
            return res.status(400).json({ message: 'ID card not available yet. Waiting for approval and PRN generation.' });
        }

        // Generate and pipe PDF directly to response
        await generateIDCardPDF(student, res);

    } catch (error) {
        console.error('ID Card Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error generating ID card', error: error.message });
        } else {
            // Header already sent, we can't send a JSON error.
            // Ending the response is the best we can do.
            if (!res.writableEnded) res.end();
        }
    }
};

export const getAvailableInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find();
        res.json(institutes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAvailableDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
