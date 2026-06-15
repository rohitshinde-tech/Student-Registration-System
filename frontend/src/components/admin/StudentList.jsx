import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import {
  Search, Eye, CheckCircle, XCircle, Clock, Hash,
  ChevronDown, X, Users, Lock, Unlock, AlertCircle, RefreshCw,
  TrendingUp, Award, FileText
} from 'lucide-react';
import PDFExportModal from './PDFExportModal';

// ── PRN Result Modal ─────────────────────────────────────────────────────────
const PRNResultModal = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">PRN Generation Complete</h3>
              <p className="text-purple-200 text-xs">Sorted alphabetically A → Z</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-800 text-sm font-medium">{result.message}</p>
        </div>

        {/* PRN List */}
        {result.generated && result.generated.length > 0 && (
          <div className="overflow-y-auto max-h-72 px-6 py-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Generated PRNs (A → Z)
            </p>
            {result.generated.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                  {item.prn}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Verification Progress Banner ─────────────────────────────────────────────
const VerificationBanner = ({ summary, onGeneratePRNs, generating }) => {
  if (!summary) return null;

  const { total, pending, approved, rejected, approvedWithoutPRN, approvedWithPRN } = summary;
  const verified = approved + rejected; // anyone who has been acted on
  const allVerified = pending === 0 && total > 0;
  const canGenerate = allVerified && approvedWithoutPRN > 0;
  const progressPct = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className={`rounded-2xl border p-5 ${allVerified && canGenerate
      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
      : allVerified && approvedWithoutPRN === 0
        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
        : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${allVerified ? 'text-purple-500' : 'text-amber-500'}`} />
          <span className="font-bold text-slate-700 text-sm">Verification Progress</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          allVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {allVerified ? 'All Verified ✓' : `${pending} Pending`}
        </span>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white/60">
          <p className="text-2xl font-bold text-slate-800">{total}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Total</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white/60">
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Pending Review</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white/60">
          <p className="text-2xl font-bold text-emerald-600">{approved}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Approved</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center border border-white/60">
          <p className="text-2xl font-bold text-rose-500">{rejected}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Rejected</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span>Verification progress</span>
          <span>{progressPct}% complete</span>
        </div>
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${allVerified ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* PRN Generation CTA */}
      <div className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        canGenerate ? 'bg-purple-600' : 'bg-white/50 border border-white/60'
      }`}>
        <div>
          {canGenerate ? (
            <>
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <Unlock className="w-4 h-4" /> Ready to Generate PRNs
              </p>
              <p className="text-purple-200 text-xs mt-0.5">
                {approvedWithoutPRN} approved student{approvedWithoutPRN !== 1 ? 's' : ''} will receive PRNs in alphabetical order (A → Z)
              </p>
            </>
          ) : approvedWithoutPRN === 0 && allVerified ? (
            <>
              <p className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
                <Award className="w-4 h-4" /> All PRNs Already Generated
              </p>
              <p className="text-emerald-600 text-xs mt-0.5">
                {approvedWithPRN} student{approvedWithPRN !== 1 ? 's' : ''} have received their PRN.
              </p>
            </>
          ) : (
            <>
              <p className="text-amber-700 font-semibold text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" /> PRN Generation Locked
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                {pending} student{pending !== 1 ? 's' : ''} still pending review — verify all before generating PRNs
              </p>
            </>
          )}
        </div>

        {canGenerate && (
          <button
            id="btn-generate-prns"
            onClick={onGeneratePRNs}
            disabled={generating}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              generating
                ? 'bg-purple-400 text-purple-100 cursor-not-allowed'
                : 'bg-white text-purple-700 hover:bg-purple-50 hover:shadow-xl'
            }`}
          >
            {generating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Hash className="w-4 h-4" /> Generate PRN for All Verified Students</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const StudentList = ({ onSelectStudent }) => {
  const { user } = useContext(AuthContext);
  const isDeptAdmin = user.role === 'dept-admin';

  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPRNs, setGeneratingPRNs] = useState(false);
  const [prnResult, setPrnResult] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', department: '', search: '' });

  const BASE = 'http://localhost:5000';
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const getApiBase = () => isDeptAdmin ? `${BASE}/api/dept-admin` : `${BASE}/api/admin`;

  // Fetch verification summary (for the banner)
  const fetchSummary = useCallback(async () => {
    try {
      const params = !isDeptAdmin && filters.department ? `?department=${filters.department}` : '';
      const { data } = await axios.get(`${getApiBase()}/students/verification-summary${params}`, config);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching verification summary', err);
    }
  }, [user.token, filters.department, isDeptAdmin]);

  // Fetch student list
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`${getApiBase()}/students?${queryParams}`, config);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students', error);
    } finally {
      setLoading(false);
    }
  }, [user.token, filters]);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchStudents();
      fetchSummary();
    }, 400);
    return () => clearTimeout(id);
  }, [fetchStudents, fetchSummary]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGeneratePRNs = async () => {
    if (!window.confirm(
      isDeptAdmin
        ? 'Generate PRNs for all approved students in your department, sorted A→Z by name?'
        : 'Generate PRNs for all approved students without a PRN, sorted A→Z by name?'
    )) return;

    setGeneratingPRNs(true);
    try {
      const payload = isDeptAdmin ? {} : { department: filters.department };
      const { data } = await axios.post(`${getApiBase()}/generate-prns`, payload, config);
      setPrnResult(data);
      // Refresh both list and summary
      await Promise.all([fetchStudents(), fetchSummary()]);
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating PRNs');
    } finally {
      setGeneratingPRNs(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
    }
  };

  return (
    <>
      {/* PRN Result Modal */}
      <PRNResultModal result={prnResult} onClose={() => setPrnResult(null)} />

      {/* Custom Student Data PDF Export Modal */}
      <PDFExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        initialFilters={filters}
      />

      <div className="space-y-5">
        {/* Verification Progress Banner */}
        <VerificationBanner
          summary={summary}
          onGeneratePRNs={handleGeneratePRNs}
          generating={generatingPRNs}
        />

        {/* Search + Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, enrollment, PRN…"
              className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            {/* Status filter */}
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Department filter — super-admin only */}
            {!isDeptAdmin && (
              <div className="relative">
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* Custom Student Data PDF Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 rounded-xl transition-all shadow-md hover:shadow-lg shadow-purple-200"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No students found matching the criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment / PRN</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {student.documents?.photo ? (
                            <img
                              className="h-9 w-9 rounded-full object-cover border-2 border-slate-100"
                              src={student.documents.photo}
                              alt=""
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {student.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-mono text-slate-700">{student.enrollmentNumber}</p>
                        {student.prn ? (
                          <p className="text-xs font-mono text-emerald-600 font-semibold mt-0.5">{student.prn}</p>
                        ) : student.status === 'Approved' ? (
                          <p className="text-xs text-purple-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting batch PRN
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {student.department || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => onSelectStudent(student._id)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && students.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center gap-4">
              <span>Showing {students.length} student{students.length !== 1 ? 's' : ''}</span>
              {summary?.pending > 0 && (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {summary.pending} pending review
                </span>
              )}
              {summary?.approvedWithoutPRN > 0 && (
                <span className="text-purple-500 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {summary.approvedWithoutPRN} awaiting PRN
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentList;
