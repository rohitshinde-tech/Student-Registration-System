import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123');

      if (decoded.role === 'admin') {
         req.user = await Admin.findById(decoded.id).select('-password');
         req.user.role = 'admin';
      } else if (decoded.role === 'dept-admin') {
         const Department = (await import('../models/Department.js')).default;
         req.user = await Department.findById(decoded.id).select('-password');
         req.user.role = 'dept-admin';
         req.user.departmentName = req.user.name; // alias for compatibility
      } else {
         req.user = await Student.findById(decoded.id).select('-password');
         req.user.role = 'student';
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
}

export const adminOrDeptAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'dept-admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
}

export const deptAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'dept-admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as department admin' });
    }
}
