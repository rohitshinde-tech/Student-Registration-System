import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  hodName: { type: String },
  username: { type: String, unique: true, sparse: true },
  password: { type: String }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
