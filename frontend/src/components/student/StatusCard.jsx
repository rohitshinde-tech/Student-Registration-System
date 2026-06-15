import { CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const StatusCard = ({ profileData }) => {
  const { user } = useContext(AuthContext);

  if (!profileData) return null;

  const handleDownload = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob', // Important for downloading files
      };
      const response = await axios.get('http://localhost:5000/api/student/idcard', config);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ID_Card_${profileData.prn}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading ID card', error);
      alert('Failed to download ID card.');
    }
  };

  const getStatusIcon = () => {
    switch (profileData.status) {
      case 'Approved': return <CheckCircle className="w-16 h-16 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-16 h-16 text-rose-500" />;
      default: return <Clock className="w-16 h-16 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Status: {profileData.status}</h2>
        
        {profileData.status === 'Pending' && (
          <p className="text-slate-500 max-w-md">Your application is currently under review by the administration. You will be notified once it is processed.</p>
        )}
        
        {profileData.status === 'Approved' && !profileData.prn && (
          <div className="mt-4 w-full max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <p className="text-blue-800 font-bold text-base">Approved — Awaiting PRN</p>
              </div>
              <p className="text-blue-600 text-sm">
                Your registration has been approved! Your Permanent Registration Number (PRN) will be assigned shortly by the administration and you will be notified by email.
              </p>
            </div>
          </div>
        )}

        {profileData.status === 'Approved' && profileData.prn && (
          <div className="mt-4">
             <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl mb-6 shadow-inner">
                <p className="text-sm uppercase tracking-wide font-semibold mb-1 opacity-80">Your PRN</p>
                <p className="text-3xl font-mono tracking-widest">{profileData.prn}</p>
             </div>
             <button onClick={handleDownload} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                <Download className="w-5 h-5 mr-2" /> Download ID Card
             </button>
          </div>
        )}


        {profileData.status === 'Rejected' && (
          <div className="mt-4 max-w-lg w-full text-left">
             <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                <h4 className="text-rose-800 font-semibold mb-2 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" /> Reason for Rejection
                </h4>
                <p className="text-rose-700">{profileData.rejectionReason}</p>
             </div>
             <p className="text-slate-600 mt-4 text-sm text-center">Please update the required documents or profile information and resubmit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusCard;
