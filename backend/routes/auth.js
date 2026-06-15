import express from 'express';
import { registerStudent, loginStudent, adminLogin, deptAdminLogin, sendResetOTP, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/admin/login', adminLogin);
router.post('/dept-admin/login', deptAdminLogin);
router.post('/forgot-password', sendResetOTP);
router.post('/reset-password', resetPassword);

export default router;
