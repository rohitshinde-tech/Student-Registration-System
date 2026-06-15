// import { useState, useContext } from 'react';
// import axios from 'axios';
// import AuthContext from '../../context/AuthContext';
// import { Save } from 'lucide-react';

// const ProfileForm = ({ profileData, setProfileData }) => {
//   const { user } = useContext(AuthContext);
//   const [formData, setFormData] = useState({
//     name: profileData?.name || '',
//     phoneNumber: profileData?.phoneNumber || '',
//     address: profileData?.address || '',
//     aadhaarNumber: profileData?.aadhaarNumber || '',
//     gender: profileData?.gender || '',
//     dateOfBirth: profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
//     category: profileData?.category || '',
//     isPWD: profileData?.isPWD || false,
//     department: profileData?.department || '',
//     institute: profileData?.institute || '',
//     batch: profileData?.batch !== undefined ? profileData?.batch : '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [institutes, setInstitutes] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const config = { headers: { Authorization: `Bearer ${user.token}` } };
//         const [instRes, deptRes] = await Promise.all([
//           axios.get('http://localhost:5000/api/student/institutes', config),
//           axios.get('http://localhost:5000/api/student/departments', config)
//         ]);
//         setInstitutes(instRes.data);
//         setDepartments(deptRes.data);
//       } catch (error) {
//         console.error('Failed to fetch config data', error);
//       }
//     };
//     fetchData();
//   }, [user.token]);

//   const isGlobalApproved = profileData?.status === 'Approved';
//   const getFieldStatus = (field) => profileData?.verification?.info?.[field];
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const isEditable = profileData?.status !== 'Approved';

//   const handleChange = (e) => {
//     const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
//     setFormData({ ...formData, [e.target.name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');
//     setError('');

//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.put('http://localhost:5000/api/student/profile', formData, config);
//       setProfileData(data);
//       setMessage('Profile updated successfully!');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error updating profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
//       <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h2>

//       {message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium">{message}</div>}
//       {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {[
//             { label: 'Full Name', name: 'name', type: 'text' },
//             { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
//             { label: 'Address', name: 'address', type: 'textarea' },
//             { label: 'Aadhaar Number', name: 'aadhaarNumber', type: 'text' },
//             { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
//             { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
//             { label: 'Category', name: 'category', type: 'select', options: ['OPEN', 'OBC', 'SC', 'ST', 'VJNT'] },
//             { label: 'Institute', name: 'institute', type: 'select', options: institutes.map(i => ({ value: i.name, label: i.name })) },
//             { label: 'Department Preferred', name: 'department', type: 'select', options: departments.map(d => ({ value: d.name, label: d.name })) },
//             { label: 'Batch', name: 'batch', type: 'select', options: [{ value: 0, label: 'Morning' }, { value: 1, label: 'Afternoon' }] }
//           ].map(field => {
//             const statusData = getFieldStatus(field.name);
//             const isRejected = statusData?.status === 'Rejected';
//             const isApproved = statusData?.status === 'Approved' || isGlobalApproved;

//             return (
//               <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
//                 <div className="flex justify-between items-end mb-2">
//                   <label className="block text-sm font-medium text-slate-700">{field.label}</label>
//                   {isRejected && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Rejected</span>}
//                   {statusData?.status === 'Approved' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Approved</span>}
//                 </div>

//                 {field.type === 'textarea' ? (
//                   <textarea name={field.name} value={formData[field.name]} onChange={handleChange} disabled={isApproved} required rows="3" className={`w-full px-4 py-3 rounded-xl border ${isRejected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500`} />
//                 ) : field.type === 'select' ? (
//                   <select name={field.name} value={formData[field.name]} onChange={handleChange} disabled={isApproved} required className={`w-full px-4 py-3 rounded-xl border ${isRejected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 bg-white`}>
//                     <option value="">Select {field.label}</option>
//                     {field.options.map(opt => {
//                       const val = typeof opt === 'object' ? opt.value : opt;
//                       const lbl = typeof opt === 'object' ? opt.label : opt;
//                       return <option key={val} value={val}>{lbl}</option>;
//                     })}
//                   </select>
//                 ) : (
//                   <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} disabled={isApproved} required className={`w-full px-4 py-3 rounded-xl border ${isRejected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500`} />
//                 )}

//                 {isRejected && statusData?.message && (
//                   <p className="mt-1 text-sm text-rose-600">{statusData.message}</p>
//                 )}
//               </div>
//             )
//           })}

//           <div className="flex items-center mt-6">
//             <input type="checkbox" name="isPWD" id="isPWD" checked={formData.isPWD} onChange={handleChange} disabled={isGlobalApproved || getFieldStatus('isPWD')?.status === 'Approved'} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-50" />
//             <label htmlFor="isPWD" className="ml-3 text-sm font-medium text-slate-700">Person with Disability (PWD)</label>
//           </div>
//         </div>

//         {(!isGlobalApproved) && (
//           <div className="pt-4 flex justify-end">
//             <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
//               <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default ProfileForm;
import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Save } from 'lucide-react';

const ProfileForm = ({ profileData, setProfileData }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    phoneNumber: profileData?.phoneNumber || '',
    address: profileData?.address || '',
    aadhaarNumber: profileData?.aadhaarNumber || '',
    gender: profileData?.gender || '',
    dateOfBirth: profileData?.dateOfBirth
      ? new Date(profileData.dateOfBirth).toISOString().split('T')[0]
      : '',
    category: profileData?.category || '',
    isPWD: profileData?.isPWD || false,
    department: profileData?.department || '',
    institute: profileData?.institute || '',
    batch: profileData?.batch ?? '',
    batchYear: profileData?.batchYear || 2026,
    batchCode: profileData?.batchCode || '0',
    admissionType: profileData?.admissionType || '',
    admissionTypeCode: profileData?.admissionTypeCode ?? 0,
    bloodGroup: profileData?.bloodGroup || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const isGlobalApproved = profileData?.status === 'Approved';

  // 🔄 Fetch institutes & departments
  useEffect(() => {
    if (!user?.token) return;

    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        const [instRes, deptRes] = await Promise.all([
          axios.get(
            'http://localhost:5000/api/student/institutes',
            config
          ),
          axios.get(
            'http://localhost:5000/api/student/departments',
            config
          ),
        ]);

        setInstitutes(instRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to fetch config data', err);
      }
    };

    fetchData();
  }, [user?.token]);

  // ✏️ Handle input change
  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;

    if (e.target.name === 'admissionType') {
        const code = value === 'Direct Second Year' ? 5 : 0;
        setFormData({ ...formData, [e.target.name]: value, admissionTypeCode: code });
    } else {
        setFormData({ ...formData, [e.target.name]: value });
    }
  };

  // 🚀 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // ✅ Basic validation
    if (formData.aadhaarNumber && formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar must be 12 digits');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        'http://localhost:5000/api/student/profile',
        formData,
        config
      );

      setProfileData(data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        'Error updating profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Personal Information
      </h2>

      {message && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Full Name', name: 'name', type: 'text' },
            { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
            { label: 'Address', name: 'address', type: 'textarea' },
            { label: 'Aadhaar Number', name: 'aadhaarNumber', type: 'password' },
            { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
            {
              label: 'Gender',
              name: 'gender',
              type: 'select',
              options: ['Male', 'Female', 'Other'],
            },
            {
              label: 'Category',
              name: 'category',
              type: 'select',
              options: ['OPEN', 'OBC', 'SC', 'ST', 'VJNT'],
            },
            {
              label: 'Blood Group',
              name: 'bloodGroup',
              type: 'select',
              options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            },
            {
              label: 'Admission Type',
              name: 'admissionType',
              type: 'select',
              options: [
                  { value: 'First Year', label: 'First Year (Code 0)' },
                  { value: 'Direct Second Year', label: 'Direct Second Year (Code 5)' }
              ],
            },
            {
              label: 'Institute',
              name: 'institute',
              type: 'select',
              options: institutes.map((i) => ({
                value: i.name,
                label: i.name,
              })),
            },
            {
              label: 'Department Preferred',
              name: 'department',
              type: 'select',
              options: departments.map((d) => ({
                value: d.name,
                label: d.name,
              })),
            },
            {
              label: 'Batch Year',
              name: 'batchYear',
              type: 'number',
            },
            {
              label: 'Batch Code',
              name: 'batchCode',
              type: 'text',
              placeholder: 'e.g., 0',
            },
            {
              label: 'Batch Timing',
              name: 'batch',
              type: 'select',
              options: [
                { value: 0, label: 'Morning' },
                { value: 1, label: 'Afternoon' },
              ],
            },
          ].map((field) => {
            return (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' ? 'md:col-span-2' : ''
                }
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {field.label}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={isGlobalApproved}
                    required
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={isGlobalApproved}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => {
                      const val =
                        typeof opt === 'object' ? opt.value : opt;
                      const lbl =
                        typeof opt === 'object' ? opt.label : opt;
                      return (
                        <option key={val} value={val}>
                          {lbl}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={isGlobalApproved}
                    placeholder={field.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                )}
              </div>
            );
          })}

          {/* PWD Checkbox */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="isPWD"
              id="isPWD"
              checked={formData.isPWD}
              onChange={handleChange}
              disabled={isGlobalApproved}
              className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isPWD" className="ml-2 text-sm font-medium text-slate-700">
              Person with Disability (PWD)
            </label>
          </div>
        </div>

        {!isGlobalApproved && (
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
ProfileForm;