import express from 'express';
import { protect, deptAdminOnly } from '../middleware/authMiddleware.js';
import { getStudents, getStudentById, updateStudentStatus, getAnalytics, generateBatchPRNs, generateStudentPRN, getVerificationSummary } from '../controllers/deptAdminController.js';

const router = express.Router();

router.route('/students')
  .get(protect, deptAdminOnly, getStudents);

router.route('/students/analytics')
  .get(protect, deptAdminOnly, getAnalytics);

router.route('/students/verification-summary')
  .get(protect, deptAdminOnly, getVerificationSummary);

router.route('/students/:id')
  .get(protect, deptAdminOnly, getStudentById)
  .put(protect, deptAdminOnly, updateStudentStatus);

router.post('/students/:id/generate-prn', protect, deptAdminOnly, generateStudentPRN);
router.post('/generate-prns', protect, deptAdminOnly, generateBatchPRNs);

export default router;
