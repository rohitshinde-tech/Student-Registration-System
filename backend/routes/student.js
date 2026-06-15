import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, uploadDocuments, downloadIDCard, getAvailableInstitutes, getAvailableDepartments } from '../controllers/studentController.js';
import { upload } from '../utils/cloudinaryConfig.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.get('/institutes', getAvailableInstitutes);
router.get('/departments', getAvailableDepartments);

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'allotmentLetter', maxCount: 1 },
  { name: 'leavingCertificate', maxCount: 1 },
  { name: 'feesReceipt', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'casteValidity', maxCount: 1 },
  { name: 'pwdCertificate', maxCount: 1 },
]);

const documentUploads = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds the maximum limit of 250 KB. Please upload a smaller file.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/upload', protect, documentUploads, uploadDocuments);
router.get('/idcard', protect, downloadIDCard);

export default router;
