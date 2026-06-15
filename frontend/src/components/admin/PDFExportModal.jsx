import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Download, Filter, CheckSquare, Square, RefreshCw, FileText, AlertCircle } from 'lucide-react';

const PDFExportModal = ({ isOpen, onClose, initialFilters }) => {
  const { user } = useContext(AuthContext);
  const isDeptAdmin = user.role === 'dept-admin';
  const deptName = user?.departmentName || user?.name || '';

  const BASE = 'http://localhost:5000';
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const getApiBase = () => isDeptAdmin ? `${BASE}/api/dept-admin` : `${BASE}/api/admin`;

  // Field selection state
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    email: true,
    prn: true,
    phoneNumber: true,
    department: true,
    admissionType: true,
    batchYear: true,
    batch: true,
    gender: false,
    address: false,
    createdAt: false,
  });

  // Filter options state
  const [localFilters, setLocalFilters] = useState({
    status: '',
    department: isDeptAdmin ? deptName : '',
    admissionType: '',
    batchYear: '',
    batch: '',
    search: '',
  });

  // Sync initial filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(prev => ({
        ...prev,
        status: initialFilters?.status || '',
        department: isDeptAdmin ? deptName : (initialFilters?.department || ''),
        search: initialFilters?.search || '',
      }));
    }
  }, [isOpen, initialFilters, isDeptAdmin, deptName]);

  const [departments, setDepartments] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Field definitions
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'prn', label: 'PRN' },
    { key: 'phoneNumber', label: 'Mobile Number' },
    { key: 'department', label: 'Department' },
    { key: 'admissionType', label: 'Course' },
    { key: 'batchYear', label: 'Year' },
    { key: 'batch', label: 'Division' },
    { key: 'gender', label: 'Gender' },
    { key: 'address', label: 'Address' },
    { key: 'createdAt', label: 'Admission Date' },
  ];

  // Fetch departments for Super Admin
  useEffect(() => {
    if (isOpen && !isDeptAdmin) {
      const fetchDepts = async () => {
        try {
          const { data } = await axios.get(`${BASE}/api/admin/departments`, config);
          setDepartments(data);
        } catch (err) {
          console.error('Failed to fetch departments', err);
        }
      };
      fetchDepts();
    }
  }, [isOpen, isDeptAdmin]);

  // Fetch live count matching the filters
  const fetchMatchingCount = useCallback(async () => {
    if (!isOpen) return;
    setLoadingCount(true);
    setError('');
    try {
      const queryParams = new URLSearchParams(localFilters).toString();
      const { data } = await axios.get(`${getApiBase()}/students?${queryParams}`, config);
      setRecordCount(data.length);
    } catch (err) {
      console.error('Error fetching record count', err);
      setError('Failed to fetch real-time matching student count.');
    } finally {
      setLoadingCount(false);
    }
  }, [isOpen, localFilters]);

  // Debounced count checking
  useEffect(() => {
    const delayDebounceId = setTimeout(() => {
      fetchMatchingCount();
    }, 450);
    return () => clearTimeout(delayDebounceId);
  }, [fetchMatchingCount]);

  if (!isOpen) return null;

  const handleFieldToggle = (key) => {
    setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (select) => {
    const updated = {};
    fields.forEach(f => {
      updated[f.key] = select;
    });
    setSelectedFields(updated);
  };

  const handleFilterChange = (e) => {
    setLocalFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isAllSelected = Object.values(selectedFields).every(val => val === true);
  const isNoneSelected = Object.values(selectedFields).every(val => val === false);

  const handleGeneratePDF = async () => {
    if (isNoneSelected) {
      setError('Please select at least one field to export in the PDF.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      // Fetch full details of filtered students
      const queryParams = new URLSearchParams(localFilters).toString();
      const { data: students } = await axios.get(`${getApiBase()}/students?${queryParams}`, config);

      if (students.length === 0) {
        setError('No student records found matching the current filter options.');
        setExporting(false);
        return;
      }

      // Determine PDF Layout (landscape if > 5 columns are selected)
      const selectedFieldKeys = fields.filter(f => selectedFields[f.key]);
      const orientation = selectedFieldKeys.length > 5 ? 'landscape' : 'portrait';

      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.width;

      // Primary colors matching the theme
      const primaryColor = [109, 40, 217]; // violet-700
      
      // Document Header
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Title
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Smart Student Registration Portal', 15, 15);

      // Subtitle
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Report: Custom Student Export`, 15, 22);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 27);
      doc.text(`Generated By: ${user.role === 'admin' ? 'Super Admin' : `Dept Admin (${deptName})`}`, 15, 32);

      // Filter Criteria badge
      const activeFilters = [];
      if (localFilters.status) activeFilters.push(`Status: ${localFilters.status}`);
      if (localFilters.department) activeFilters.push(`Dept: ${localFilters.department}`);
      if (localFilters.admissionType) activeFilters.push(`Course: ${localFilters.admissionType}`);
      if (localFilters.batchYear) activeFilters.push(`Year: ${localFilters.batchYear}`);
      if (localFilters.batch !== '') activeFilters.push(`Div: ${localFilters.batch === '0' ? 'Morning' : 'Afternoon'}`);
      if (localFilters.search) activeFilters.push(`Search: "${localFilters.search}"`);
      
      const filterSummary = activeFilters.length > 0 ? activeFilters.join(' | ') : 'All Students';
      doc.setFontSize(9);
      doc.setTextColor(109, 40, 217);
      doc.text(`Filter Applied: ${filterSummary}`, 15, 37);

      // Construct columns and rows
      const tableColumns = selectedFieldKeys.map(f => ({
        header: f.label,
        dataKey: f.key
      }));

      const tableRows = students.map(student => {
        const row = {};
        selectedFieldKeys.forEach(f => {
          let val = student[f.key];
          if (f.key === 'prn') {
            val = val || 'Awaiting PRN';
          } else if (f.key === 'batch') {
            val = val === 0 ? 'Morning' : val === 1 ? 'Afternoon' : 'N/A';
          } else if (f.key === 'createdAt') {
            val = val ? new Date(val).toLocaleDateString() : 'N/A';
          }
          row[f.key] = val || 'N/A';
        });
        return row;
      });

      // Draw Table
      autoTable(doc, {
        startY: 45,
        columns: tableColumns,
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
          halign: 'left',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        columnStyles: {
          email: { cellWidth: orientation === 'landscape' ? 45 : 35 },
          address: { cellWidth: orientation === 'landscape' ? 50 : 35 }
        },
        margin: { left: 12, right: 12, top: 45, bottom: 20 },
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth - 30,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            'Smart Registration System - Academic Report',
            12,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Save PDF file with dynamic name based on selected options
      let fileLabel = '';
      if (localFilters.department) {
        fileLabel += `_${localFilters.department.replace(/\s+/g, '_')}`;
      }
      if (localFilters.status) {
        fileLabel += `_${localFilters.status}`;
      }
      if (localFilters.admissionType) {
        fileLabel += `_${localFilters.admissionType.replace(/\s+/g, '_')}`;
      }
      if (localFilters.batchYear) {
        fileLabel += `_${localFilters.batchYear}`;
      }
      if (localFilters.batch !== '') {
        fileLabel += `_${localFilters.batch === '0' ? 'Morning' : 'Afternoon'}`;
      }

      const fileName = `Student_Data_Export${fileLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      onClose();

    } catch (err) {
      console.error('Error generating PDF', err);
      setError('An error occurred while compiling and downloading the PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Custom Student Data PDF Export</h3>
              <p className="text-purple-200 text-xs font-medium">Select dynamic fields and apply real-time filters</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* Section 1: Field Checklist */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Select Fields to Include
              </span>
              <div className="flex gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {fields.map(field => (
                <label
                  key={field.key}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                    selectedFields[field.key]
                      ? 'bg-white border-purple-200 text-purple-700 shadow-sm'
                      : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields[field.key]}
                    onChange={() => handleFieldToggle(field.key)}
                    className="sr-only"
                  />
                  {selectedFields[field.key] ? (
                    <CheckSquare className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Filters */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              2. Filter Options (Pre-generation)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {/* Name/PRN Search */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Search Name / PRN</label>
                <input
                  type="text"
                  name="search"
                  value={localFilters.search}
                  onChange={handleFilterChange}
                  placeholder="e.g. John, EN22..."
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-medium"
                />
              </div>

              {/* Department filter */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Department</label>
                {isDeptAdmin ? (
                  <input
                    type="text"
                    value={deptName}
                    disabled
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-semibold"
                  />
                ) : (
                  <select
                    name="department"
                    value={localFilters.department}
                    onChange={handleFilterChange}
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer font-medium"
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Course (Admission Type) filter */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Course (Admission)</label>
                <select
                  name="admissionType"
                  value={localFilters.admissionType}
                  onChange={handleFilterChange}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer font-medium"
                >
                  <option value="">All Courses</option>
                  <option value="First Year">First Year</option>
                  <option value="Direct Second Year">Direct Second Year</option>
                </select>
              </div>

              {/* Year filter */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Batch Year</label>
                <select
                  name="batchYear"
                  value={localFilters.batchYear}
                  onChange={handleFilterChange}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer font-medium"
                >
                  <option value="">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* Division (Batch Timing) filter */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Division (Batch)</label>
                <select
                  name="batch"
                  value={localFilters.batch}
                  onChange={handleFilterChange}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer font-medium"
                >
                  <option value="">All Divisions</option>
                  <option value="0">Morning</option>
                  <option value="1">Afternoon</option>
                </select>
              </div>

              {/* Verification status filter */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Verification Status</label>
                <select
                  name="status"
                  value={localFilters.status}
                  onChange={handleFilterChange}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved / Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary & Action buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loadingCount ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                Calculating matching records...
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1.5 rounded-lg border border-slate-200">
                Students to export: <span className="text-purple-700 font-extrabold text-sm">{recordCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={exporting || recordCount === 0 || loadingCount}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-md ${
                exporting || recordCount === 0 || loadingCount
                  ? 'bg-purple-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 hover:shadow-lg'
              }`}
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PDFExportModal;
