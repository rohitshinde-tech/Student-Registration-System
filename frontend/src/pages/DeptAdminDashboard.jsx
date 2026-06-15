import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { LogOut, Users, BarChart3, Menu, X, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import StudentList from '../components/admin/StudentList';
import StudentDetail from '../components/admin/StudentDetail';

const DeptAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'dept-admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'analytics', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
  ];

  const deptName = user?.departmentName || user?.name || 'Department';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Dept Admin</span>
                <span className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{deptName}</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedStudentId(null); }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
              <div className="pl-4 ml-4 border-l border-slate-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-slate-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 pb-4 px-4 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedStudentId(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedStudentId ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <StudentDetail
              studentId={selectedStudentId}
              onBack={() => setSelectedStudentId(null)}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Page Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                  {deptName}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'analytics' && 'Department Overview'}
                {activeTab === 'students' && 'Student Applications'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                {activeTab === 'analytics' && `Analytics and key metrics for ${deptName}.`}
                {activeTab === 'students' && `Review, verify, and approve student applications for ${deptName}.`}
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'students' && (
                <StudentList onSelectStudent={setSelectedStudentId} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeptAdminDashboard;
