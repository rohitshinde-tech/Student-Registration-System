import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  idCardBackground: { type: String },
  registrarName: { type: String },
  registrarSignature: { type: String },
  formDeadline: { type: Date }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export default SystemSettings;
