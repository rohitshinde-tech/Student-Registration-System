import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // Authentication
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Information
  phoneNumber: { type: String },
  address: { type: String },
  aadhaarNumber: { type: String, sparse: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  category: { type: String, enum: ['OPEN', 'OBC', 'SC', 'ST', 'VJNT'] },
  isPWD: { type: Boolean, default: false },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

  // Documents (URLs from Cloudinary)
  documents: {
    photo: { type: String },
    signature: { type: String },
    aadhaarCard: { type: String },
    marksheet: { type: String },
    allotmentLetter: { type: String },
    leavingCertificate: { type: String },
    feesReceipt: { type: String },
    incomeCertificate: { type: String },
    casteCertificate: { type: String },
    casteValidity: { type: String },
    pwdCertificate: { type: String },
  },

  batch: { type: Number, enum: [0, 1] }, // 0: morning, 1: afternoon
  batchYear: { type: Number, default: 2026 },
  batchCode: { type: String, default: '0' }, // For PRN generation
  institute: { type: String },
  admissionType: { type: String, enum: ['First Year', 'Direct Second Year'] },
  admissionTypeCode: { type: Number, enum: [0, 5], default: 0 },

  // Verification & Processing
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String },
  prn: { type: String, unique: true, sparse: true },
  department: { type: String }, // Assigned later or part of admission
  
  // Granular Verification
  verification: {
    info: {
      name: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      phoneNumber: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      address: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      aadhaarNumber: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      gender: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      dateOfBirth: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      category: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      isPWD: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      bloodGroup: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
    },
    documents: {
      photo: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      signature: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      aadhaarCard: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      marksheet: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      allotmentLetter: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      leavingCertificate: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      feesReceipt: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      incomeCertificate: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      casteCertificate: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      casteValidity: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
      pwdCertificate: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, message: String },
    }
  },

  // Reset Password
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },

}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
