import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getStudents, getStudentById, updateStudentStatus, getAnalytics, getDepartments, createDepartment, updateDepartment, generateBatchPRNs, generateStudentPRN, getInstitutes, createInstitute, getSettings, updateSettings, getVerificationSummary } from '../controllers/adminController.js';
import { upload } from '../utils/cloudinaryConfig.js';

const router = express.Router();

router.route('/students')
  .get(protect, adminOnly, getStudents);

router.route('/students/analytics')
  .get(protect, adminOnly, getAnalytics);

router.route('/students/verification-summary')
  .get(protect, adminOnly, getVerificationSummary);

router.route('/students/:id')
  .get(protect, adminOnly, getStudentById)
  .put(protect, adminOnly, updateStudentStatus);

router.route('/departments')
  .get(protect, adminOnly, getDepartments)
  .post(protect, adminOnly, createDepartment);

router.route('/departments/:id')
  .put(protect, adminOnly, updateDepartment);

router.post('/students/:id/generate-prn', protect, adminOnly, generateStudentPRN);
router.post('/generate-prns', protect, adminOnly, generateBatchPRNs);

router.route('/institutes')
  .get(protect, adminOnly, getInstitutes)
  .post(protect, adminOnly, createInstitute);

router.route('/settings')
  .get(protect, adminOnly, getSettings)
  .put(protect, adminOnly, upload.fields([
    { name: 'idCardBackground', maxCount: 1 },
    { name: 'registrarSignature', maxCount: 1 }
  ]), updateSettings);

export default router;
