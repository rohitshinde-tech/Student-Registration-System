import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import Department from '../models/Department.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey123', {
    expiresIn: '30d',
  });
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, enrollmentNumber, password } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ 
      $or: [{ email }, { enrollmentNumber }] 
    });

    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email or enrollment number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student
    const student = await Student.create({
      name,
      email,
      enrollmentNumber,
      password: hashedPassword,
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        role: 'student',
        token: generateToken(student._id, 'student'),
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or enrollmentNumber

    const student = await Student.findOne({
      $or: [{ email: loginId }, { enrollmentNumber: loginId }, { prn: loginId }]
    });

    if (student && (await bcrypt.compare(password, student.password))) {
      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        status: student.status,
        prn: student.prn,
        role: 'student',
        token: generateToken(student._id, 'student'),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password }  = req.body;

    // For demo purposes, if no admin exists, create one
    let admin = await Admin.findOne({ email });
    if (!admin && email === 'admin@system.com' && password === 'admin123') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        admin = await Admin.create({ name: 'Super Admin', email, password: hashedPassword });
    }

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deptAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const dept = await Department.findOne({ username });

    if (dept && (await bcrypt.compare(password, dept.password))) {
      res.json({
        _id: dept._id,
        name: dept.hodName || dept.name + ' Admin',
        departmentId: dept._id,
        departmentName: dept.name,
        role: 'dept-admin',
        token: generateToken(dept._id, 'dept-admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid department admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const sendResetOTP = async (req, res) => {
  try {
    const { enrollmentNumber } = req.body;

    const student = await Student.findOne({ enrollmentNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student with this enrollment number not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (10 minutes)
    student.resetPasswordOTP = otp;
    student.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;

    await student.save();

    const emailSent = await sendEmail(
      student.email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    );

    if (emailSent) {
      res.json({ message: 'OTP sent to your registered email' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { enrollmentNumber, otp, newPassword } = req.body;

    const student = await Student.findOne({
      enrollmentNumber,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!student) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    student.password = hashedPassword;
    student.resetPasswordOTP = undefined;
    student.resetPasswordOTPExpires = undefined;

    await student.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      _id: student._id,
      name: student.name,
      email: student.email,
      enrollmentNumber: student.enrollmentNumber,
      status: student.status,
      prn: student.prn,
      role: 'student',
      token: generateToken(student._id, 'student'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
