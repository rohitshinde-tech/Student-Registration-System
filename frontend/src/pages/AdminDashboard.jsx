import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { LogOut, Users, BarChart3, Building, Layers, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import StudentList from '../components/admin/StudentList';
import StudentDetail from '../components/admin/StudentDetail';
import Institutes from '../components/admin/Institutes';
import Departments from '../components/admin/Departments';
import Settings from '../components/admin/Settings';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'students', label: 'Students Queue', icon: Users },
    { id: 'institutes', label: 'Institutes', icon: Building },
    { id: 'departments', label: 'Departments', icon: Layers },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Horizontal Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
                AdminPortal
              </h2>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSelectedStudentId(null); }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
              <div className="pl-4 ml-4 border-l border-slate-200">
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center px-4 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-slate-900 focus:outline-none"
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
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full px-4 py-3 text-base font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedStudentId ? (
            <StudentDetail 
                studentId={selectedStudentId} 
                onBack={() => setSelectedStudentId(null)} 
            />
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <header className="mb-8">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeTab === 'analytics' && 'Dashboard Overview'}
                      {activeTab === 'students' && 'Student Applications'}
                      {activeTab === 'institutes' && 'Manage Institutes'}
                      {activeTab === 'departments' && 'Manage Departments'}
                      {activeTab === 'settings' && 'System Configuration'}
                  </h1>
                  <p className="text-slate-500 mt-1">
                      {activeTab === 'analytics' && 'Monitor key metrics and application statuses.'}
                      {activeTab === 'students' && 'Review and process student applications.'}
                      {activeTab === 'institutes' && 'Configure participating institutes.'}
                      {activeTab === 'departments' && 'Configure academic departments and HODs.'}
                      {activeTab === 'settings' && 'Manage global system settings and deadlines.'}
                  </p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    {activeTab === 'analytics' && <AdminAnalytics />}
                    {activeTab === 'students' && <StudentList onSelectStudent={setSelectedStudentId} />}
                    {activeTab === 'institutes' && <Institutes />}
                    {activeTab === 'departments' && <Departments />}
                    {activeTab === 'settings' && <Settings />}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
