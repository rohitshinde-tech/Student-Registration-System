import Student from '../models/Student.js';
import Institute from '../models/Institute.js';
import Department from '../models/Department.js';

export const generatePRN = async (student) => {
    // YY (2): Batch/Passing Year
    // In many systems, this is the current year or graduation year. 
    // Based on example 26, let's assume it's the batch year. 
    // If not provided, we'll use current year + 2 (assuming 3-year diploma or similar)
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const yy = student.batchYear ? student.batchYear.toString().slice(-2) : '26'; 

    // B (1): Batch Code
    const b = student.batchCode || '0';

    // IIII (4): Institute Code
    const institute = await Institute.findOne({ name: student.institute });
    const iiii = institute?.code?.padStart(4, '0') || '3033';

    // DDDD (4): Department Code
    const department = await Department.findOne({ name: student.department });
    const dddd = department?.code?.padStart(4, '0') || '1245';

    // A (1): Admission Type Code
    const a = student.admissionTypeCode !== undefined ? student.admissionTypeCode : 0;

    // SS (2): Serial Number
    // Find the latest student with same prefix
    const prefix = `${yy}${b}${iiii}${dddd}${a}`;
    const lastStudent = await Student.findOne({ 
        prn: new RegExp(`^${prefix}`) 
    }).sort({ prn: -1 });

    let serialNumber = 1;
    if (lastStudent && lastStudent.prn) {
        const lastSerialStr = lastStudent.prn.slice(-2);
        serialNumber = parseInt(lastSerialStr, 10) + 1;
    }

    const ss = serialNumber.toString().padStart(2, '0');

    const prn = `${yy}${b}${iiii}${dddd}${a}${ss}`;
    return prn;
};
