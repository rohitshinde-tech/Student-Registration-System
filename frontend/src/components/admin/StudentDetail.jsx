import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, AlertTriangle, Check, X, Hash, Info,
  User, Calendar, Droplets, CreditCard, ShieldAlert, Phone, Mail, MapPin, Award, BookOpen, Clock, CalendarRange, Eye
} from 'lucide-react';

const StudentDetail = ({ studentId, onBack }) => {
  const { user } = useContext(AuthContext);
  const isDeptAdmin = user.role === 'dept-admin';

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [department, setDepartment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectingField, setRejectingField] = useState(null);
  const [rejectingType, setRejectingType] = useState(null);
  const [fieldRejectionReason, setFieldRejectionReason] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const BASE = 'http://localhost:5000';

  const getEndpoint = (path) =>
    isDeptAdmin ? `${BASE}/api/dept-admin${path}` : `${BASE}/api/admin${path}`;

  const fetchStudent = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(getEndpoint(`/students/${studentId}`), config);
      setStudent(data);
      setDepartment(data.department || '');
    } catch (error) {
      console.error('Error fetching student', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId, user.token]);

  const handleAction = async (status) => {
    // For dept-admin, department is already set on the student; skip the frontend guard
    if (!isDeptAdmin && status === 'Approved' && !department) {
      alert('Please assign a department before approving.');
      return;
    }
    if (status === 'Rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        getEndpoint(`/students/${studentId}`),
        { status, rejectionReason, department: isDeptAdmin ? student.department : department },
        config
      );
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchStudent();
    } catch (error) {
      console.error('Error updating status', error);
      alert(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleGranularVerification = async (type, field, fieldStatus, message = '') => {
    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(getEndpoint(`/students/${studentId}`), {
        verificationUpdates: [{ type, field, fieldStatus, message }]
      }, config);
      await fetchStudent();
    } catch (error) {
      console.error('Error updating granular status', error);
      alert('Error updating status');
    } finally {
      setUpdating(false);
      setRejectingField(null);
      setRejectingType(null);
      setFieldRejectionReason('');
    }
  };

  const handleUpdateDepartment = async () => {
    if (!department) return;
    setUpdating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(getEndpoint(`/students/${studentId}`), { department }, config);
      await fetchStudent();
      alert('Department updated successfully');
    } catch (error) {
      alert('Error updating department');
    } finally {
      setUpdating(false);
    }
  };

  // Individual PRN generation removed — PRNs are now generated in batch from the student list.

  if (loading) return (
    <div className="p-12 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
  if (!student) return <div className="p-8 text-slate-500">Student not found</div>;

  const statusColor = {
    Approved: 'bg-emerald-100 text-emerald-800',
    Rejected: 'bg-rose-100 text-rose-800',
    Pending: 'bg-amber-100 text-amber-800',
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Students
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="relative">
                <img
                  src={student.documents?.photo || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                />
                <span className={`absolute bottom-4 right-0 w-4 h-4 rounded-full border-2 border-white ${student.status === 'Approved' ? 'bg-emerald-400' : student.status === 'Rejected' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
              <p className="text-slate-500 text-sm">{student.email}</p>
              <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColor[student.status] || statusColor.Pending}`}>
                {student.status}
              </span>
            </div>

            {/* Key Details */}
            <div className="py-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Enrollment No.</p>
                <p className="font-mono text-slate-800 font-semibold text-sm">{student.enrollmentNumber}</p>
              </div>
              {student.prn ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-1">PRN</p>
                  <p className="font-mono text-emerald-700 font-bold text-sm">{student.prn}</p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold">PRN Not Assigned</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Department</p>
                <p className="text-slate-700 font-medium text-sm">{student.department || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Category / PWD</p>
                <p className="text-slate-700 text-sm">{student.category} {student.isPWD ? '(PWD)' : ''}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Phone</p>
                <p className="text-slate-700 text-sm">{student.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Admission Type</p>
                <p className="text-slate-700 text-sm">{student.admissionType || 'N/A'}</p>
              </div>
            </div>

            {/* Assign Department — only for super-admin */}
            {!isDeptAdmin && (
              <div className="py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Assign Department</p>
                <div className="flex">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={student.status === 'Approved'}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-slate-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-l-lg bg-slate-50 border"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                  {student.status !== 'Approved' && (
                    <button
                      onClick={handleUpdateDepartment}
                      disabled={updating}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-r-lg transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              {student.status !== 'Approved' && (
                <button
                  onClick={() => handleAction('Approved')}
                  disabled={updating || (!isDeptAdmin && !department)}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all ${
                    updating || (!isDeptAdmin && !department)
                      ? 'bg-emerald-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isDeptAdmin ? 'Approve Student' : 'Approve & Assign PRN'}
                </button>
              )}

              {student.status !== 'Rejected' && (
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={updating}
                  className="w-full flex justify-center items-center py-3 px-4 border border-rose-200 rounded-xl shadow-sm text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all"
                >
                  <XCircle className="w-5 h-5 mr-2" /> Reject Application
                </button>
              )}

              {/* PRN status — batch-only generation */}
              {student.status === 'Approved' && !student.prn && (
                <div className="w-full flex items-start gap-3 py-3 px-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Awaiting Batch PRN</p>
                    <p className="text-xs text-indigo-500 mt-0.5">PRNs are assigned to all verified students at once, in alphabetical order, from the student list.</p>
                  </div>
                </div>
              )}

              {/* Show PRN badge if already generated */}
              {student.status === 'Approved' && student.prn && (
                <div className="w-full flex items-center justify-center py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
                  <Hash className="w-4 h-4 mr-2" /> PRN: {student.prn}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Redesigned Student Profile Information Dashboard */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" /> Student Profile Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Personal Profile */}
              <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/60">
                    <User className="w-4 h-4 text-purple-500" /> Personal Profile
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Full Name</p>
                        <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Date of Birth</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Gender</p>
                        <p className="text-sm font-semibold text-slate-800">{student.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplets className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Blood Group</p>
                        <p className="text-sm font-semibold text-slate-800">{student.bloodGroup || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Aadhaar Number</p>
                        <p className="text-sm font-mono font-semibold text-slate-800">{student.aadhaarNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Category</p>
                        <p className="text-sm font-semibold text-slate-800">{student.category || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">PWD Status</p>
                        <p className="text-sm font-semibold text-slate-800">{student.isPWD ? 'Yes (Person with Disability)' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact & Address */}
              <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/60">
                    <Phone className="w-4 h-4 text-purple-500" /> Contact & Address
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Phone Number</p>
                        <p className="text-sm font-semibold text-slate-800">{student.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Email Address</p>
                        <p className="text-sm font-semibold text-slate-800 break-all">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Residential Address</p>
                        <p className="text-sm font-semibold text-slate-750 leading-relaxed break-words">{student.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Academic Details */}
              <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/60">
                    <BookOpen className="w-4 h-4 text-purple-500" /> Academic Information
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <Award className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Institute</p>
                        <p className="text-sm font-semibold text-slate-800">{student.institute || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Assigned / Preferred Department</p>
                        <p className="text-sm font-semibold text-slate-800">{student.department || 'Not Assigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Admission Type</p>
                        <p className="text-sm font-semibold text-slate-800">{student.admissionType || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Enrollment Number</p>
                        <p className="text-sm font-mono font-semibold text-slate-800">{student.enrollmentNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: System & Registration Batch */}
              <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200/60">
                    <Clock className="w-4 h-4 text-purple-500" /> Batch & Registration
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Batch Timing</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {student.batch === 0 ? 'Morning' : student.batch === 1 ? 'Afternoon' : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarRange className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Batch Year</p>
                        <p className="text-sm font-semibold text-slate-800">{student.batchYear || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Batch Code</p>
                        <p className="text-sm font-mono font-semibold text-slate-800">{student.batchCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Document Verification */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" /> Uploaded Documents
            </h3>

            {(!student.documents || Object.keys(student.documents).length === 0) ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(student.documents).filter(([, url]) => url).map(([key, url]) => {
                  const verifStatus = student.verification?.documents?.[key]?.status || 'Pending';
                  const cleanKey = key.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-purple-300 transition-colors">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {cleanKey}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          verifStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700'
                          : verifStatus === 'Rejected' ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {verifStatus}
                        </span>
                      </div>
                      
                      {verifStatus === 'Rejected' && student.verification?.documents?.[key]?.message && (
                        <p className="text-xs text-rose-600 bg-rose-50/50 p-2 rounded-lg mb-3 border border-rose-100 font-medium">
                          Reason: {student.verification.documents[key].message}
                        </p>
                      )}

                      {url.endsWith('.pdf') ? (
                        <div
                          className="h-32 flex items-center justify-center bg-slate-50 w-full rounded-lg mb-3 cursor-pointer hover:bg-slate-100 transition-colors group relative"
                          onClick={() => setSelectedDoc({ name: cleanKey, url })}
                        >
                          <FileText className="w-12 h-12 text-slate-400 group-hover:scale-105 transition-transform" />
                          <span className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition-opacity font-semibold text-sm">
                            <Eye className="w-5 h-5 mr-1" /> Quick View
                          </span>
                        </div>
                      ) : (
                        <div 
                          className="h-32 w-full rounded-lg mb-3 bg-slate-50 cursor-pointer overflow-hidden group relative flex items-center justify-center"
                          onClick={() => setSelectedDoc({ name: cleanKey, url })}
                        >
                          <img
                            src={url}
                            alt={key}
                            className="h-full object-contain w-full rounded-lg group-hover:scale-105 transition-all duration-300"
                          />
                          <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-sm">
                            <Eye className="w-5 h-5 mr-1" /> Quick View
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc({ name: cleanKey, url })}
                          className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View Full
                        </button>
                        <div className="flex gap-2">
                          {verifStatus !== 'Approved' && (
                            <button
                              onClick={() => handleGranularVerification('documents', key, 'Approved')}
                              disabled={updating}
                              className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
                              title="Approve Document"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {verifStatus !== 'Rejected' && (
                            <button
                              onClick={() => { setRejectingType('documents'); setRejectingField(key); }}
                              disabled={updating}
                              className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors cursor-pointer"
                              title="Reject Document"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal — Whole Application */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Reject Application</h3>
            <p className="text-slate-500 text-sm mb-4">
              Provide a clear reason. Consider rejecting specific fields instead if only some items are wrong.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500 mb-6 text-sm resize-none"
              rows="4"
              placeholder="e.g., Application incomplete — missing certificate."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                disabled={updating || !rejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-medium text-sm disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal — Granular Field */}
      {rejectingField && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Reject — {rejectingField.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              The student will only need to correct this specific item.
            </p>
            <textarea
              value={fieldRejectionReason}
              onChange={(e) => setFieldRejectionReason(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500 mb-6 text-sm resize-none"
              rows="4"
              placeholder="e.g., Document is blurry or unreadable."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectingField(null); setFieldRejectionReason(''); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGranularVerification(rejectingType, rejectingField, 'Rejected', fieldRejectionReason)}
                disabled={updating || !fieldRejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-medium text-sm disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800 capitalize">
                  {selectedDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-slate-200/80 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 bg-slate-900/95 p-6 flex justify-center items-center overflow-auto min-h-[50vh] max-h-[75vh]">
              {selectedDoc.url.toLowerCase().endsWith('.pdf') || selectedDoc.url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={selectedDoc.url}
                  title={selectedDoc.name}
                  className="w-full h-[70vh] rounded-xl border-0 shadow-lg bg-white"
                />
              ) : (
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-850"
                />
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">Viewing uploaded document for verification</span>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
