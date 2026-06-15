import Student from '../models/Student.js';
import DepartmentModel from '../models/Department.js';
import Institute from '../models/Institute.js';
import { sendEmail } from '../utils/emailService.js';
import { generateBatchPRNs as adminGenerateBatchPRNs } from './adminController.js';
import { updateStudentStatus as adminUpdateStudentStatus } from './adminController.js';

// Helper: get dept name from req.user (Department model uses 'name' field)
const getDeptName = (reqUser) => reqUser.name;

export const getStudents = async (req, res) => {
    try {
        const { status, category, search, admissionType, batchYear, batch } = req.query;
        const deptName = getDeptName(req.user);
        let query = { department: deptName };

        if (status) query.status = status;
        if (category) query.category = category;
        if (admissionType) query.admissionType = admissionType;
        if (batchYear) query.batchYear = Number(batchYear);
        if (batch !== undefined && batch !== '') query.batch = Number(batch);

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { enrollmentNumber: { $regex: search, $options: 'i' } },
                { prn: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const deptName = getDeptName(req.user);
        const student = await Student.findOne({ _id: req.params.id, department: deptName }).select('-password');
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found in your department' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateStudentStatus = async (req, res) => {
    const deptName = getDeptName(req.user);
    // Ensure the student belongs to their department
    const student = await Student.findOne({ _id: req.params.id, department: deptName });
    if (!student) {
        return res.status(404).json({ message: 'Student not found in your department' });
    }
    // Delegate to admin controller
    return adminUpdateStudentStatus(req, res);
};

export const getAnalytics = async (req, res) => {
    try {
        const deptName = getDeptName(req.user);
        const totalStudents = await Student.countDocuments({ department: deptName });
        const pending = await Student.countDocuments({ department: deptName, status: 'Pending' });
        const approved = await Student.countDocuments({ department: deptName, status: 'Approved' });
        const rejected = await Student.countDocuments({ department: deptName, status: 'Rejected' });

        const genderStats = await Student.aggregate([
            { $match: { department: deptName } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        res.json({
            totalStudents,
            statusCounts: { pending, approved, rejected },
            genderStats: genderStats.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unknown']: curr.count }), {})
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
    }
};

export const generateBatchPRNs = async (req, res) => {
    // Force department to the dept-admin's own department
    req.body.department = getDeptName(req.user);
    return adminGenerateBatchPRNs(req, res);
};

export const getVerificationSummary = async (req, res) => {
    try {
        const deptName = getDeptName(req.user);
        const matchFilter = { department: deptName };

        const [total, pending, approved, rejected, approvedWithPRN] = await Promise.all([
            Student.countDocuments(matchFilter),
            Student.countDocuments({ ...matchFilter, status: 'Pending' }),
            Student.countDocuments({ ...matchFilter, status: 'Approved' }),
            Student.countDocuments({ ...matchFilter, status: 'Rejected' }),
            Student.countDocuments({ ...matchFilter, status: 'Approved', prn: { $exists: true, $ne: null, $ne: '' } }),
        ]);

        const approvedWithoutPRN = approved - approvedWithPRN;

        res.json({ total, pending, approved, rejected, approvedWithPRN, approvedWithoutPRN });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching verification summary', error: error.message });
    }
};

// Generate PRN for a single approved student in this department
export const generateStudentPRN = async (req, res) => {
    try {
        const deptName = getDeptName(req.user);
        const student = await Student.findOne({ _id: req.params.id, department: deptName });
        if (!student) {
            return res.status(404).json({ message: 'Student not found in your department' });
        }
        if (student.status !== 'Approved') {
            return res.status(400).json({ message: 'Student must be approved before generating a PRN.' });
        }
        if (student.prn) {
            return res.status(400).json({ message: `PRN already exists: ${student.prn}` });
        }

        const yy = student.batchYear ? student.batchYear.toString().slice(-2) : '26';
        const b = student.batchCode || '0';

        const inst = await Institute.findOne({ name: student.institute });
        const iiii = inst?.code?.padStart(4, '0') || '3033';

        const dept = await DepartmentModel.findOne({ name: deptName });
        const dddd = dept?.code?.padStart(4, '0') || '1245';

        const a = student.admissionTypeCode !== undefined ? student.admissionTypeCode : 0;
        const prefix = `${yy}${b}${iiii}${dddd}${a}`;

        const lastStudent = await Student.findOne({
            prn: new RegExp(`^${prefix}`)
        }).sort({ prn: -1 });

        let serialNumber = 1;
        if (lastStudent && lastStudent.prn) {
            const lastSerialStr = lastStudent.prn.slice(-2);
            serialNumber = parseInt(lastSerialStr, 10) + 1;
        }

        const ss = serialNumber.toString().padStart(2, '0');
        student.prn = `${prefix}${ss}`;
        await student.save();

        const emailText = `Dear ${student.name},\n\nYour Permanent Registration Number (PRN) has been generated: ${student.prn}.\n\nYou can now log in to the portal and download your ID card.\n\nBest Regards,\nSmart Institute of Technology`;
        await sendEmail(student.email, 'PRN Generated', emailText);

        res.json({ message: `PRN generated successfully: ${student.prn}`, prn: student.prn });
    } catch (error) {
        res.status(500).json({ message: 'Server error generating PRN', error: error.message });
    }
};
