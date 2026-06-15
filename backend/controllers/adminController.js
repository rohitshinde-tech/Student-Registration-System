import Student from '../models/Student.js';
import DepartmentModel from '../models/Department.js';
import Institute from '../models/Institute.js';
import SystemSettings from '../models/SystemSettings.js';
import { generatePRN } from '../utils/prnGenerator.js';
import { sendEmail } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';

export const getStudents = async (req, res) => {
    try {
        const { status, department, category, search, admissionType, batchYear, batch } = req.query;
        let query = {};

        if (status) query.status = status;
        if (department) query.department = department;
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
        const student = await Student.findById(req.params.id).select('-password');
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateStudentStatus = async (req, res) => {
    try {
        const { status, rejectionReason, department } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (req.body.verificationUpdates && Array.isArray(req.body.verificationUpdates)) {
            let needsEmail = false;
            let emailReasons = [];
            
            req.body.verificationUpdates.forEach(update => {
                const { type, field, fieldStatus, message } = update; 
                if (!student.verification) student.verification = { info: {}, documents: {} };
                if (!student.verification[type]) student.verification[type] = {};
                if (!student.verification[type][field]) student.verification[type][field] = {};

                student.verification[type][field].status = fieldStatus;
                student.verification[type][field].message = message || '';
                
                if (fieldStatus === 'Rejected') {
                    needsEmail = true;
                    emailReasons.push(`${field}: ${message}`);
                }
            });
            await student.save();
            
            if (needsEmail) {
                 const emailText = `Dear ${student.name},\n\nSome of your registration details/documents have been rejected for the following reasons:\n${emailReasons.join('\n')}\n\nPlease log in to the portal, update the necessary information, and resubmit.\n\nBest Regards,\nSmart Institute of Technology`;
                 await sendEmail(student.email, 'Registration Needs Attention', emailText);
            }
            
            return res.json({ message: 'Granular verification updated', student });
        }

        if (status === 'Approved' && student.status !== 'Approved') {
            student.status = 'Approved';
            student.rejectionReason = '';
            
            if (department) student.department = department;
            if (!student.department) {
                 return res.status(400).json({ message: 'Department must be assigned before approval' });
            }

            await student.save();

            // Send Email
            const emailText = `Dear ${student.name},\n\nYour registration has been approved.\n\nYou can now log in to the portal.\n\nBest Regards,\nSmart Institute of Technology`;
            await sendEmail(student.email, 'Registration Approved', emailText);

            return res.json({ message: 'Student approved' });
        } else if (status === 'Rejected') {
            student.status = 'Rejected';
            student.rejectionReason = rejectionReason;
            await student.save();

            const emailText = `Dear ${student.name},\n\nYour registration documents have been reviewed and were rejected for the following reason:\n${rejectionReason}\n\nPlease log in to the portal, update the necessary documents, and resubmit.\n\nBest Regards,\nSmart Institute of Technology`;
            await sendEmail(student.email, 'Registration Needs Attention', emailText);

            return res.json({ message: 'Student rejected' });
        }

        // Just updating other fields
        if (department) student.department = department;
        await student.save();
        res.json({ message: 'Student updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const pending = await Student.countDocuments({ status: 'Pending' });
        const approved = await Student.countDocuments({ status: 'Approved' });
        const rejected = await Student.countDocuments({ status: 'Rejected' });

        const deptStats = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        const genderStats = await Student.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        res.json({
            totalStudents,
            statusCounts: { pending, approved, rejected },
            departmentStats: deptStats.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unassigned']: curr.count }), {}),
            genderStats: genderStats.reduce((acc, curr) => ({ ...acc, [curr._id || 'Unknown']: curr.count }), {})
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
    }
};

// Department Controllers
export const getDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const { name, code, hodName, username, password } = req.body;
        
        let deptData = { name, code, hodName, username };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            deptData.password = await bcrypt.hash(password, salt);
        }

        const dept = new DepartmentModel(deptData);
        await dept.save();
        res.status(201).json(dept);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { hodName, username, password } = req.body;
        const dept = await DepartmentModel.findById(req.params.id);

        if (!dept) {
            return res.status(404).json({ message: 'Department not found' });
        }

        if (hodName) dept.hodName = hodName;
        if (username) dept.username = username;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            dept.password = await bcrypt.hash(password, salt);
        }

        await dept.save();
        res.json({ message: 'Department updated successfully', dept });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Institute Controllers
export const getInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find();
        res.json(institutes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createInstitute = async (req, res) => {
    try {
        const { name, code } = req.body;
        const institute = new Institute({ name, code });
        await institute.save();
        res.status(201).json(institute);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Settings Controllers
export const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({});
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings();
        
        // Handle file uploads if present
        if (req.files) {
            if (req.files['idCardBackground']) {
                settings.idCardBackground = req.files['idCardBackground'][0].path;
            }
            if (req.files['registrarSignature']) {
                settings.registrarSignature = req.files['registrarSignature'][0].path;
            }
        }

        // Handle text fields
        settings.registrarName = req.body.registrarName || settings.registrarName;
        if (req.body.formDeadline) {
            settings.formDeadline = new Date(req.body.formDeadline);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const generateBatchPRNs = async (req, res) => {
    try {
        const { department } = req.body;

        // Only approved students without a PRN, sorted alphabetically by name
        let query = { status: 'Approved', $or: [{ prn: { $exists: false } }, { prn: null }, { prn: '' }] };
        if (department) {
            query.department = department;
        }

        let students = await Student.find(query);

        // Sort students using studentName.toLowerCase() in ascending order
        students.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        if (students.length === 0) {
            return res.json({ message: 'No approved students without a PRN found.', count: 0, generated: [] });
        }

        // Cache institute/dept codes to avoid redundant DB queries
        const instCache = {};
        const deptCache = {};

        // Track current max serial per prefix IN-MEMORY so batch serials are consecutive
        const prefixSerialMap = {};
        const generatedList = [];

        for (let student of students) {
            const yy = student.batchYear ? student.batchYear.toString().slice(-2) : '26';
            const b = student.batchCode || '0';

            if (!instCache[student.institute]) {
                const inst = await Institute.findOne({ name: student.institute });
                instCache[student.institute] = inst?.code?.padStart(4, '0') || '3033';
            }
            const iiii = instCache[student.institute];

            if (!deptCache[student.department]) {
                const dept = await DepartmentModel.findOne({ name: student.department });
                deptCache[student.department] = dept?.code?.padStart(4, '0') || '1245';
            }
            const dddd = deptCache[student.department];

            const a = student.admissionTypeCode !== undefined ? student.admissionTypeCode : 0;
            const prefix = `${yy}${b}${iiii}${dddd}${a}`;

            // First encounter of this prefix: seed from DB max serial
            if (prefixSerialMap[prefix] === undefined) {
                const lastStudent = await Student.findOne({
                    prn: new RegExp(`^${prefix}\\d{2}$`)
                }).sort({ prn: -1 });

                prefixSerialMap[prefix] = lastStudent?.prn
                    ? parseInt(lastStudent.prn.slice(-2), 10)
                    : 0;
            }

            // Increment in-memory counter for this prefix
            prefixSerialMap[prefix] += 1;
            const ss = prefixSerialMap[prefix].toString().padStart(2, '0');
            student.prn = `${prefix}${ss}`;
            await student.save();

            generatedList.push({ name: student.name, prn: student.prn });

            // Notify student via email
            const emailText = `Dear ${student.name},\n\nYour Permanent Registration Number (PRN) has been generated: ${student.prn}.\n\nYou can now log in to the portal and download your ID card.\n\nBest Regards,\nSmart Institute of Technology`;
            await sendEmail(student.email, 'PRN Generated', emailText);
        }

        res.json({
            message: `PRNs generated successfully in alphabetical order. Total PRNs generated: ${students.length}`,
            count: students.length,
            generated: generatedList,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error generating batch PRNs', error: error.message });
    }
};

// Generate PRN for a single approved student (super-admin)
export const getVerificationSummary = async (req, res) => {
    try {
        const { department } = req.query;
        const matchFilter = department ? { department } : {};

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

export const generateStudentPRN = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.status !== 'Approved') {
            return res.status(400).json({ message: 'Student must be approved before generating a PRN.' });
        }
        if (student.prn) {
            return res.status(400).json({ message: `PRN already exists: ${student.prn}` });
        }
        if (!student.department) {
            return res.status(400).json({ message: 'Student must be assigned a department first.' });
        }

        const yy = student.batchYear ? student.batchYear.toString().slice(-2) : '26';
        const b = student.batchCode || '0';

        const inst = await Institute.findOne({ name: student.institute });
        const iiii = inst?.code?.padStart(4, '0') || '3033';

        const dept = await DepartmentModel.findOne({ name: student.department });
        const dddd = dept?.code?.padStart(4, '0') || '1245';

        const a = student.admissionTypeCode !== undefined ? student.admissionTypeCode : 0;
        const prefix = `${yy}${b}${iiii}${dddd}${a}`;

        const lastStudent = await Student.findOne({
            prn: new RegExp(`^${prefix}\\d{2}$`)
        }).sort({ prn: -1 });

        const serialNumber = lastStudent?.prn
            ? parseInt(lastStudent.prn.slice(-2), 10) + 1
            : 1;

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

