import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

const AdminAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const endpoint = user.role === 'admin' 
          ? 'http://localhost:5000/api/admin/students/analytics'
          : 'http://localhost:5000/api/dept-admin/students/analytics';
        const response = await axios.get(endpoint, config);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user.token]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  if (!data) return null;

  const statusData = [
    { name: 'Pending', value: data.statusCounts.pending },
    { name: 'Approved', value: data.statusCounts.approved },
    { name: 'Rejected', value: data.statusCounts.rejected },
  ];

  const deptData = data.departmentStats ? Object.keys(data.departmentStats).map(key => ({
    name: key,
    Students: data.departmentStats[key]
  })) : [];

  const genderData = data.genderStats ? Object.keys(data.genderStats).map(key => ({
    name: key,
    value: data.genderStats[key]
  })) : [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-slate-500 text-sm font-medium mb-1">Total Students</p>
            <h3 className="text-3xl font-bold text-slate-800">{data.totalStudents}</h3>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-center">
            <p className="text-amber-600 text-sm font-medium mb-1">Pending Review</p>
            <h3 className="text-3xl font-bold text-amber-700">{data.statusCounts.pending}</h3>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-center">
            <p className="text-emerald-600 text-sm font-medium mb-1">Approved</p>
            <h3 className="text-3xl font-bold text-emerald-700">{data.statusCounts.approved}</h3>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-center">
            <p className="text-rose-600 text-sm font-medium mb-1">Rejected</p>
            <h3 className="text-3xl font-bold text-rose-700">{data.statusCounts.rejected}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Application Status Distribution</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#10b981' : entry.name === 'Rejected' ? '#f43f5e' : '#f59e0b'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Gender Analysis Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Gender Distribution</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            dataKey="value"
                        >
                            {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Male' ? '#3b82f6' : entry.name === 'Female' ? '#ec4899' : '#8b5cf6'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Department Bar Chart */}
        {data.departmentStats && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Students by Department</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} />
                            <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
