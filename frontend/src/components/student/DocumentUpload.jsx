import { useState, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentUpload = ({ profileData, setProfileData }) => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const isEditable = profileData?.status !== 'Approved';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 250 * 1024) {
        setError("File size exceeds the maximum limit of 250 KB. Please upload a smaller file.");
        setMessage('');
        e.target.value = null; // Clear the input field
        const newFiles = { ...files };
        delete newFiles[e.target.name];
        setFiles(newFiles);
        return;
      }
      setError('');
      setFiles({ ...files, [e.target.name]: file });
    } else {
      const newFiles = { ...files };
      delete newFiles[e.target.name];
      setFiles(newFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all required docs are present (either already uploaded or in files state)
    const missingDocs = requiredDocs.filter(doc => !existingDocs[doc.name] && !files[doc.name]);
    
    if (missingDocs.length > 0) {
      return setError(`Please upload all necessary documents: ${missingDocs.map(d => d.label).join(', ')}`);
    }

    // Double check size of files in files state
    for (const key in files) {
      if (files[key] && files[key].size > 250 * 1024) {
        return setError("File size exceeds the maximum limit of 250 KB. Please upload a smaller file.");
      }
    }

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    for (const key in files) {
      formData.append(key, files[key]);
    }

    try {
      const config = {
        headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
        }
      };
      const { data } = await axios.post('http://localhost:5000/api/student/upload', formData, config);
      
      // Update profile data with new document URLs
      setProfileData({ ...profileData, documents: data.documents, status: profileData.status === 'Rejected' ? 'Pending' : profileData.status });
      setMessage('All documents uploaded and submitted successfully!');
      setFiles({});
      if(formRef.current) formRef.current.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading documents');
    } finally {
      setLoading(false);
    }
  };

  const requiredDocs = [
    { name: 'photo', label: 'Passport Size Photo' },
    { name: 'signature', label: 'Signature' },
    { name: 'aadhaarCard', label: 'Aadhaar Card' },
    { name: 'marksheet', label: '10th / 12th Marksheet' },
    { name: 'allotmentLetter', label: 'Allotment Letter' },
    { name: 'leavingCertificate', label: 'Leaving Certificate (LC)' },
    { name: 'feesReceipt', label: 'Fees Receipt' },
  ];

  if (profileData?.category && profileData.category !== 'OPEN') {
    requiredDocs.push({ name: 'incomeCertificate', label: 'Income Certificate' });
    requiredDocs.push({ name: 'casteCertificate', label: 'Caste Certificate' });
    requiredDocs.push({ name: 'casteValidity', label: 'Caste Validity' });
  }

  if (profileData?.isPWD) {
    requiredDocs.push({ name: 'pwdCertificate', label: 'PWD Certificate' });
  }

  const existingDocs = profileData?.documents || {};

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Document Upload</h2>
      <p className="text-slate-500 mb-8">Upload clear images or PDFs of the requested documents. Max size 250 KB per document.</p>
      
      {message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium">{message}</div>}
      {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocs.map((doc) => (
            <div key={doc.name} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-semibold text-slate-700">{doc.label}</label>
                  {existingDocs[doc.name] ? (
                      <div className="flex flex-col items-end gap-1">
                          {profileData?.verification?.documents?.[doc.name]?.status === 'Approved' ? (
                             <span className="text-emerald-500 flex items-center text-xs font-medium bg-emerald-50 px-2 py-1 rounded-md">
                                 <CheckCircle className="w-3 h-3 mr-1" /> Approved
                             </span>
                          ) : profileData?.verification?.documents?.[doc.name]?.status === 'Rejected' ? (
                             <span className="text-rose-500 flex items-center text-xs font-medium bg-rose-50 px-2 py-1 rounded-md">
                                 <AlertCircle className="w-3 h-3 mr-1" /> Rejected
                             </span>
                          ) : (
                             <a href={existingDocs[doc.name]} target="_blank" rel="noreferrer" className="text-blue-500 flex items-center text-xs font-medium bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                 <CheckCircle className="w-3 h-3 mr-1" /> View Uploaded
                             </a>
                          )}
                      </div>
                  ) : (
                      <span className="text-amber-500 flex items-center text-xs font-medium bg-amber-50 px-2 py-1 rounded-md">
                          <AlertCircle className="w-3 h-3 mr-1" /> Missing
                      </span>
                  )}
              </div>
              
              {profileData?.verification?.documents?.[doc.name]?.status === 'Rejected' && profileData?.verification?.documents?.[doc.name]?.message && (
                  <p className="text-xs text-rose-600 mb-3">{profileData.verification.documents[doc.name].message}</p>
              )}
              
              <input 
                type="file" 
                name={doc.name} 
                onChange={handleFileChange} 
                disabled={profileData?.verification?.documents?.[doc.name]?.status === 'Approved' || profileData?.status === 'Approved'}
                accept=".jpg,.jpeg,.png,.pdf"
                className={`block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${profileData?.verification?.documents?.[doc.name]?.status === 'Rejected' ? 'file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 border border-rose-200 p-1 rounded-full' : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'} disabled:opacity-50 cursor-pointer`}
              />
            </div>
          ))}
        </div>

        {isEditable && (
          <div className="pt-6 flex justify-end border-t border-slate-100 mt-8">
            <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              <UploadCloud className="w-5 h-5 mr-2" /> {loading ? 'Uploading...' : 'Upload Selected Documents'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DocumentUpload;
