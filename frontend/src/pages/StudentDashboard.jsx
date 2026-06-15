import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProfileForm from '../components/student/ProfileForm';
import DocumentUpload from '../components/student/DocumentUpload';
import StatusCard from '../components/student/StatusCard';
import { LogOut, User as UserIcon, FileText, LayoutDashboard, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role === 'admin') {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/student/profile', config);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile Info', icon: UserIcon },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Horizontal Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                SmartRegistration
              </h2>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
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
                    className="flex items-center px-4 py-2 text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
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
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'dashboard' && 'Welcome, ' + (profileData?.name || 'Student')}
            {activeTab === 'profile' && 'Profile Information'}
            {activeTab === 'documents' && 'Document Upload'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your registration process</p>
        </header>

        <div className="max-w-4xl">
          {activeTab === 'dashboard' && <StatusCard profileData={profileData} />}
          {activeTab === 'profile' && <ProfileForm profileData={profileData} setProfileData={setProfileData} />}
          {activeTab === 'documents' && <DocumentUpload profileData={profileData} setProfileData={setProfileData} />}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
